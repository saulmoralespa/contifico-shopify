import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { cors } from "remix-utils/cors";
import { authenticate } from "../shopify.server";
import { getContifico } from "~/models/Contifico.server";
import clientContifico from '~/lib';
import { dateNow, extractCedula, generateCodeShipping, nextConsecutive } from "~/helpers";


export const loader = async ({ request }: LoaderFunctionArgs) => {
	let response = json({});
	return await cors(request, response);
};

export const action = async ({ request }: ActionFunctionArgs) => {


    let response = json({message: "Method not allowed"}, 405);

    if (request.method !== 'POST') {
        return await cors(request, response);
    }

    try {
        const exception = new Error();
        const { session } = await authenticate.admin(request);
        const { shop } = session;

        const config = await getContifico(shop);

        if (!config) {
            exception.name = 'NotFoundValue';
            exception.message = `No se han establecido el apiKey, apiToken de contifico`;
            throw exception;
        }

        const { apiKey, apiToken } = config;
        const { customer, lineItems, shippingLine, name:nameOrder, totalPriceSet, taxLines } = await request.json();
        const { metafieldTypePerson, metafieldIdentification, displayName, addresses, email:emailCustomer, phone } = customer;
        const { code:codeShipping } = shippingLine;
        const { address1, address2, city, province} = addresses.pop();

        const typePerson = metafieldTypePerson?.value ?? null;
        const identification = metafieldIdentification?.value ? extractCedula(metafieldIdentification?.value) :  '';


        if(!identification){
            exception.name = 'NotFoundValue';
            exception.message = `No se ha recibido Cédula o RUC`;
            throw exception;
        }

        const contifico = clientContifico(apiKey);
        const params = new URLSearchParams();
        params.append('identificacion', identification);
        const query =  `?${params.toString()}`;
        let resultPeople = await contifico.getPeople(query);
        let cliente;
        
        if(!resultPeople.length){
            cliente = {
                tipo: typePerson === 'Juridica' ? 'J' : 'N',  //N:Natural J:Juridica I:SinId P:Placa)
                razon_social: displayName,
                telefonos: phone,
                direccion: `${address1} ${address2}, ${city}, ${province}`,
                es_cliente: true,
                es_vendedor: false,
                es_proveedor: false,
                es_extranjero: false,
                cedula: identification,
                email: emailCustomer,
            };
            await contifico.createPerson(apiToken, cliente);
        }else {
            const { cedula, razon_social, telefonos, direccion, tipo, email, es_cliente, es_vendedor, es_proveedor, es_extranjero }:any = resultPeople.pop();
            cliente = {cedula, razon_social, telefonos, direccion, tipo, email, es_cliente, es_vendedor, es_proveedor, es_extranjero};
        }
        const items = lineItems.nodes  ?? [];
        const taxOrder = taxLines.pop();
        const shippingItemCode = codeShipping ? generateCodeShipping(codeShipping) : null;
        let detalles:any = [];
        let subtotal = 0;
        let ratePercentage = 0;


        for(const item of items){
            const { sku, name, originalUnitPriceSet, discountedTotalSet, taxLines, product, quantity } = item;
            //const totalDiscount = totalDiscountSet.shopMoney.amount;
            
            if(!sku) {
                exception.name = 'NotFoundValue';
                exception.message = `Product ${name} without sku`;
                throw exception;
            }

            const params = new URLSearchParams();
            params.append('codigo', sku);
            const query =  `?${params.toString()}`;
            const tax = taxLines.pop();
            let resultProduct = await contifico.getProducts(query);
            let productData;

            if(resultProduct.length > 0){
                productData = resultProduct.pop();
            }else {
                let dataProduct = {
                    minimo: "0.0",
                    pvp1: originalUnitPriceSet.shopMoney.amount,
                    pv2: discountedTotalSet.shopMoney.amount,
                    pvp3: discountedTotalSet.shopMoney.amount,
                    pvp4: discountedTotalSet.shopMoney.amount,
                    nombre: name,
                    estado: "A",
                    codigo: sku,
                    cantidad_stock: product.totalInventory.toString()
                };
                productData = await contifico.createProduct(dataProduct);
            }

            const price = Number(productData?.pvp1) ?? 0;
            ratePercentage = Number(tax?.ratePercentage) ?? 0;
            const percentageDiscount = 0.00;
            const basePrice = (+price * quantity) - percentageDiscount;

            subtotal += ratePercentage ? basePrice : 0;
            
            const base_gravable = ratePercentage > 12 ?  (basePrice - ((percentageDiscount / 100 ) * basePrice)) : 0.00;
            const base_cero = base_gravable ? 0.00 : basePrice;
            const base_no_gravable = ratePercentage > 12 ? 0.00 : (basePrice - ((percentageDiscount / 100 ) * basePrice));

            detalles = [
                ...detalles,
                {
                    producto_id: productData?.id,
                    cantidad: quantity,
                    precio: price,
                    porcentaje_iva: tax?.ratePercentage,
                    porcentaje_descuento: percentageDiscount,
                    base_cero,
                    base_gravable,
                    base_no_gravable
                }
            ]
        }

        if(shippingItemCode){
            const params = new URLSearchParams();
            params.append('codigo', shippingItemCode);
            const query =  `?${params.toString()}`;

            let resultProduct = await contifico.getProducts(query);
            let productData = resultProduct?.length && Array.isArray(resultProduct) ? resultProduct?.pop() : null;

            if(productData){
                const price = Number(productData?.pvp1) ?? 0;
                const porcentajeIva = Number(productData?.porcentaje_iva) ?? 0;
                const basePrice = +price;

                subtotal += porcentajeIva ? basePrice : 0;
                const base_gravable = porcentajeIva > 12 ?  basePrice : 0.00;
                const base_cero = base_gravable ? 0.00 : basePrice;
                const base_no_gravable = ratePercentage > 12 ? 0.00 : basePrice;


                detalles = [
                    ...detalles,
                    {
                        producto_id: productData?.id,
                        cantidad: 1.0,
                        precio: price,
                        porcentaje_iva: productData?.porcentaje_iva,
                        porcentaje_descuento: 0,
                        base_cero,
                        base_gravable,
                        base_no_gravable
                    }
                ]

            }
        }

        const paramsDocument = new URLSearchParams();
        paramsDocument.append('result_size', '1');
        paramsDocument.append('tipo', 'FAC');
        const queryDocument =  `?result_size=1&tipo=FAC`;

        const lastDocumentCreated = await contifico.getDocuments(queryDocument);
        const { documento:documentLast }:any = lastDocumentCreated.length ? lastDocumentCreated.pop() : '';

        if(!documentLast){
            exception.message = `No se pudo obtener el último documento`;
            throw exception;
        }

        const newNumberSerie = nextConsecutive(documentLast);

        const document = {
            pos: apiToken,
            fecha_emision: dateNow(),
            tipo_documento: "FAC", //FAC factura
            documento: newNumberSerie,
            estado: "P",
            electronico: true,
            cliente,
            descripcion: `Número de pedido ${nameOrder}`,
            subtotal_0: 0.0,
            subtotal_12: subtotal,
            iva: taxOrder.rate,
            total: Number(totalPriceSet.shopMoney.amount),
            detalles
        };
 
        const { documento } = await contifico.createDocument(document);
        response = json({ success: true, message: `Número de documento creado: ${documento}`, documento}, 200);

    } catch (error:any) {
        const message = error?.response?.data?.mensaje || error.message;
        const status = error?.response?.status;
        response = json({ success: false, message }, status);
    }

    return await cors(request, response);
};
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getContifico } from "~/models/Contifico.server";
import clientContifico from '~/lib';
import { dateNow } from "~/helpers";


export const action = async ({ request }: ActionFunctionArgs) => {
    
    if (request.method !== "POST") {
        return json({ message: "Method not allowed" }, 405);
    }

    try {
        const { session } = await authenticate.admin(request);
        const { shop } = session;

        const config = await getContifico(shop);

        if (!config) {
            throw Error('No se han establecido el apiKey, apiToken de contifico');
        }

        const { apiKey, apiToken } = config;
        const { customer, lineItems, name:nameOrder, totalPriceSet, taxLines } = await request.json();
        const { metafield, displayName, addresses, email:emailCustomer, phone } = customer;
        const { address1, address2, city, province} = addresses.pop();

        const metafieldIdentification = metafield?.value ?? null;

        const contifico = clientContifico(apiKey);
        const params = new URLSearchParams();
        params.append('identificacion', metafieldIdentification);
        const query =  `?${params.toString()}`;
        let resultPeople = await contifico.getPeople(query);
        let cliente;
        
        if(!resultPeople.length){
            cliente = {
                tipo: "N",  //N:Natural J:Juridica I:SinId P:Placa)
                razon_social: displayName,
                telefonos: phone,
                direccion: `${address1} ${address2}, ${city}, ${province}`,
                es_cliente: true,
                es_vendedor: false,
                es_proveedor: false,
                es_extranjero: false,
                cedula: metafieldIdentification,
                email: emailCustomer,
            };
            await contifico.createPerson(apiToken, cliente);
        }else {
            const { cedula, razon_social, telefonos, direccion, tipo, email, es_cliente, es_vendedor, es_proveedor, es_extranjero }:any = resultPeople.pop();
            cliente = {cedula, razon_social, telefonos, direccion, tipo, email, es_cliente, es_vendedor, es_proveedor, es_extranjero};
        }
        const items = lineItems.nodes  ?? [];
        const taxOrder = taxLines.pop();
        let detalles:any = [];
        let subtotal = 0;


        for(const item of items){
            const { sku, name, originalUnitPriceSet, discountedTotalSet, totalDiscountSet, taxLines, product, quantity } = item;
            const percentageDiscount = totalDiscountSet.shopMoney.amount
            
            if(!sku) return;

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
            const basePrice = (+price * quantity) - percentageDiscount;

            subtotal += basePrice;

            detalles = [
                ...detalles,
                {
                    producto_id: productData?.id,
                    cantidad: quantity,
                    precio: price,
                    porcentaje_iva: tax?.ratePercentage,
                    porcentaje_descuento: percentageDiscount,
                    base_cero: 0.00,
                    base_gravable: basePrice,
                    base_no_gravable: 0.00
                }
            ]
        }

        const document = {
            pos: apiToken,
            fecha_emision: dateNow(),
            tipo_documento: "PRE", //FAC factura
            estado: "P",
            cliente,
            descripcion: `Prefactura pedido ${nameOrder}`,
            subtotal_0: 0.0,
            subtotal_12: subtotal,
            iva: taxOrder.rate,
            total: Number(totalPriceSet.shopMoney.amount),
            detalles
        };

        console.log(document);

        const resultDocument = await contifico.createDocument(document);
        console.log(resultDocument);
        return json({ success: true }, 200);

    } catch (error:any) {
        const errorMessage = error?.response?.data;
        const status = error?.response?.status;
        return json({ success: false, ...errorMessage }, status);
    }
};
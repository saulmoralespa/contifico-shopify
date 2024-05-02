import clientAxios from "./config/axios";
import type { Account } from "./interfaces/account";
import type { Bank } from "./interfaces/bank";
import type { BankMovement } from "./interfaces/bankMovement";
import type { Brand } from "./interfaces/brand";
import type { Category } from "./interfaces/category";
import type { Cellar } from "./interfaces/cellar";
import type { CostCenter, CostCenterResponse } from "./interfaces/costCenter";
import type { CrossDocument } from "./interfaces/crossDocument";
import type { Document } from "./interfaces/document";
import type { Guide } from "./interfaces/guide";
import type { Movement } from "./interfaces/movement";
import type { Person } from "./interfaces/person";
import type { Product, Stock } from "./interfaces/producto";
import type { Seat, SeatResponse } from "./interfaces/seat";
import type { Variant } from "./interfaces/variant";


function clientContifico(apiKey:string) {

    const client = clientAxios(apiKey);

    const getSeat = async (id:string):Promise<SeatResponse> => {
        const { data } = await client.get(`contabilidad/asiento/${id}`);
        return data;
    }
    
    const createSeat = async (body:Seat) => {
        const { data } = await client.post(`contabilidad/asiento`, body);
        return data;
    }

    const getAccounts = async(params = {}):Promise<Account[]> => {
        const { data } = await client.get('contabilidad/cuenta-contable/', {
            params
        });
        return data;
    }
    
    const getAccount = async (id:string):Promise<Account>  => {
        const { data } = await client.get(`contabilidad/cuenta-contable/${id}`);
        return data;
    }
    


    const getListCostCenters = async():Promise<CostCenterResponse[]> => {
        const { data } = await client.get(`contabilidad/centro-costo/`);
        return data;
    }
    
    
    const getCostCenter = async (id:string):Promise<CostCenterResponse> => {
        const { data } = await client.get(`contabilidad/centro-costo/${id}`);
        return data;
    }

    const createCostCenter = async (body:CostCenter):Promise<CostCenterResponse> => {
        const { data } = await client.post(`contabilidad/centro-costo`, body);
        return data;
    }

    const getPeople = async(query:string = ''):Promise<[Person]> => {
        const { data } = await client.get(`persona/${query}`);
        return data;
    }

    const getPerson = async (id:string):Promise<Person> => {
        const { data } = await client.get(`persona/${id}`);
        return data;
    }

    const createPerson = async (token:string, body:Person):Promise<Person> => {
        const { data } = await client.post(`persona/?pos=${token}`, body);
        return data;
    }

    const updatePerson = async (token:string, body:Person):Promise<Person> => {
        const { data } = await client.put(`persona/?pos=${token}`, body);
        return data;
    }


    const getCategories = async():Promise<Category[]> => {
        const { data } = await client.get(`categoria`);
        return data;
    }

    const getCategory = async (id:string):Promise<Category> => {
        const { data } = await client.get(`categoria/${id}`);
        return data;
    }

    const createCategory = async (body:Category):Promise<Category> => {
        const { data } = await client.post(`categoria`, body);
        return data;
    }

    const getCellars = async():Promise<Cellar[]> => {
        const { data } = await client.get(`bodega`);
        return data;
    }

    const getCellar = async (id:string):Promise<Cellar> => {
        const { data } = await client.get(`bodega/${id}`);
        return data;
    }

    const getVariants = async():Promise<Variant[]> => {
        const { data } = await client.get(`variante`);
        return data;
    }

    const getVariant = async (id:string):Promise<Variant> => {
        const { data } = await client.get(`variante/${id}`);
        return data;
    }

    const getProducts = async (query:string = ''):Promise<[Product]> => {
        const { data } = await client.get(`producto/${query}`);
        return data;
    }

    const getProduct = async (id:string):Promise<Product> => {
        const { data } = await client.get(`producto/${id}`);
        return data;
    }

    const createProduct = async (body:Product):Promise<Product> => {
        const { data } = await client.post(`producto/`, body);
        return data;
    }

    const editProduct = async(id:string, body:Product):Promise<Product> => {
        const { data } = await client.patch(`producto/${id}`, body);
        return data;
    }

    const getStockProduct = async (id:string):Promise<Stock[]> => {
        const { data } = await client.get(`producto/${id}/stock`);
        return data;
    }

    const getMovements = async(params = {}):Promise<Movement[]> => {
        const { data } = await client.get(`movimiento-inventario`, {
            params
        });
        return data;
    }

    const getMovement = async (id:string):Promise<Movement> => {
        const { data } = await client.get(`movimiento-inventario/${id}`);
        return data;
    }

    const createMovement = async (body:Movement) => {
        const { data } = await client.post(`movimiento-inventario`, body);
        return data;
    }

    const getGuides = async():Promise<Guide[]> => {
        const { data } = await client.get(`inventario/guia`);
        return data;
    }

    const createGuide = async (body:Guide) => {
        const { data } = await client.post(`inventario/guia`, body);
        return data;
    }

    const getBrands = async():Promise<Brand[]> => {
        const { data } = await client.get(`marca`);
        return data;
    }

    const getBrand = async (id:string):Promise<Brand> => {
        const { data } = await client.get(`marca/${id}`);
        return data;
    }

    const getDocuments = async(query:string = ''):Promise<[Document]> => {
        const { data } = await client.get(`registro/documento/${query}`);
        return data;
    }

    const getDocument = async (id:string):Promise<Document> => {
        const { data } = await client.get(`documento/${id}`);
        return data;
    }

    const createDocument = async(body:Document, params = {}):Promise<Document> => {
        const { data } = await client.post(`documento/`, body, {
            params
        });
        return data;
    }

    const updateDocument = async (body:Document):Promise<Document> => {
        const { data } = await client.put(`documento`, body);
        return data;
    }

    const crossDocument = async (body:CrossDocument):Promise<CrossDocument> => {
        const { data } = await client.post(`documento/cruce`, body);
        return data;
    }

    const crossAccountDocument = async(body:CrossDocument, params = {}):Promise<CrossDocument> => {
        const { data } = await client.post(`documento/cruce_cuenta`, body, {
            params
        });
        return data;
    }

    const getBanks = async():Promise<Bank[]> => {
        const { data } = await client.get(`banco/cuenta`);
        return data;
    }

    const getBank = async (id:string):Promise<Bank> => {
        const { data } = await client.get(`banco/cuenta/${id}`);
        return data;
    }

    const getBanksMovements = async():Promise<BankMovement[]> => {
        const { data } = await client.get(`banco/movimiento`);
        return data;
    }

    const getBankMovement = async (id:string):Promise<BankMovement> => {
        const { data } = await client.get(`banco/movimiento/${id}`);
        return data;
    }

    return {
        getSeat,
        createSeat,
        getAccounts,
        getAccount,
        getListCostCenters,
        getCostCenter,
        createCostCenter,
        getPeople,
        getPerson,
        createPerson,
        updatePerson,
        getCategories,
        getCategory,
        createCategory,
        getCellars,
        getCellar,
        getVariants,
        getVariant,
        getProducts,
        getProduct,
        createProduct,
        editProduct,
        getStockProduct,
        getMovements,
        getMovement,
        createMovement,
        getGuides,
        createGuide,
        getBrands,
        getBrand,
        getDocuments,
        getDocument,
        createDocument,
        updateDocument,
        crossDocument,
        crossAccountDocument,
        getBanks,
        getBank,
        getBanksMovements,
        getBankMovement
    }

}



export default clientContifico;
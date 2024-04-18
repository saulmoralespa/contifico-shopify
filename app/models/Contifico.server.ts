import type { ContificoConfig } from "~/lib/interfaces/contificoConfig";
import db from "../db.server";

export async function getContifico(shop:string):Promise<ContificoConfig | null> {
    const result = await db.contifico.findFirst({ where: { shop } });
    return result;
}
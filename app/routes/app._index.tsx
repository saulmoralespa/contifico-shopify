import { useState, useCallback } from "react";
import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Button,
  BlockStack,
  Form,
  FormLayout,
  TextField,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getContifico } from "~/models/Contifico.server";
import db from '../db.server';
import type { ContificoConfig } from "~/lib/interfaces/contificoConfig";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const config = await getContifico(shop);

  return json(config);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;


  const body = {
    ...Object.fromEntries(await request.formData()),
    shop,
  } as unknown as ContificoConfig;

  let {id, ...data} = body;
  id = typeof id !== "number" ? parseInt(id) : id;
  let message;

  try {
      if(!id){
        await db.contifico.create({ data });
      }else{
        await db.contifico.update({
          where: {id},
          data
        });
      }
      message = {
        success: true
      }
    } catch (error:any){
      message = {
        success: true,
        error: error?.message
      }
  }

  return json(message);
};

export default function Index() {

  const contifico: ContificoConfig = useLoaderData();
  const id = contifico && contifico.id ? contifico.id : '';
  const configApiKey = contifico && contifico.apiKey ? contifico.apiKey : '';
  const configApiToken = contifico && contifico.apiToken ? contifico.apiToken : '';


  const [apiKey, setApikey] = useState(configApiKey);
  const [apiToken, setApiToken] = useState(configApiToken);
  const [loading, setLoading] = useState(false);
  const [isError, setIsEror] = useState(false);
  const submit = useSubmit();
  const handleSubmit = async() => {
    
    setIsEror(false);
    setLoading(true);

    if(!apiKey.length || 
      !apiToken.length) {
      setIsEror(true);
      setLoading(false);
      return;
    }

    const data = {
      id,
      apiKey,
      apiToken
    }

    submit(data, { method: "post" });
    setLoading(false);

  };

  const handleApiKeyChange = useCallback((value: string) => setApikey(value), []);
  const handleApiTokenChange = useCallback((value: string) => setApiToken(value), []);

  return (
    <Page>
      <ui-title-bar title="Configuraciones Contífico"></ui-title-bar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  label="API Key"
                  type="password"
                  autoComplete="API Key"
                  requiredIndicator={true}
                  loading={loading}
                  error={isError}
                  helpText={
                    <span>API key previamente solicitada a contífico</span>
                  }
                ></TextField>
                <TextField
                  value={apiToken}
                  onChange={handleApiTokenChange}
                  label="API Token"
                  type="password"
                  autoComplete="API Token"
                  requiredIndicator={true}
                  loading={loading}
                  error={isError}
                  helpText={
                    <span>API Token previamente solicitada a contífico</span>
                  }
                ></TextField>
                <Button loading={loading} submit>Guardar Cambios</Button>
              </FormLayout>
            </Form>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
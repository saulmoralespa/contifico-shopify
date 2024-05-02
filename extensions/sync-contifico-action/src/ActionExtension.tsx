import {useEffect, useState} from 'react';
import { GET_ORDER_BY_ID_QUERY } from '../../../app/graphql/queries/getOrderById';
import { ORDER_CUSTOM_ATTRIBUTE_CREATE } from '../../../app/graphql/mutations/orderCustomAttributeCreate';
import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Button,
  Text
} from '@shopify/ui-extensions-react/admin';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.order-details.action.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const {close, data} = useApi(TARGET);
  const [orderData, setOrderData] = useState();
  const [identification, setIdentification] = useState();
  const [loading, setLoading] = useState(true);
  const [loadingSync, setLoadingSync] = useState(false);
  const [statusSync, setStatusSync] = useState(false);
  const [documento, setDocument] = useState('');
  const [messageResult, setMessageResult] = useState('');
  // Use direct API calls to fetch data from Shopify.
  // See https://shopify.dev/docs/api/admin-graphql for more information about Shopify's GraphQL API
  useEffect(() => {
    async function getOrderInfo() {
      const getDataQuery = {
        query: GET_ORDER_BY_ID_QUERY,
        variables: { id: data.selected[0].id },
      };
  
      try {
        const res = await fetch("shopify:admin/api/graphql.json", {
          method: "POST",
          body: JSON.stringify(getDataQuery),
        });
  
        if (!res.ok) {
          throw new Error('Network error');
        }
  
        const dataResult = await res.json();
        const { order } = dataResult.data;
        const { customAttributes, customer } = order;
        const attributeDocumentId = customAttributes.find((attr:any) => attr.key === "document-id-contifico");
        const status = attributeDocumentId !== undefined && Object.keys(attributeDocumentId).length > 0;
        const metafieldIdentification = customer?.metafieldIdentification?.value ?? null;
        setOrderData(order);
        setStatusSync(status);
        setIdentification(metafieldIdentification);
      } catch (error) {
        console.error('Error fetching order:', error.message);
      }

      setLoading(false);
    }
  
    if (data.selected.length > 0) {
      getOrderInfo();
    }
  }, [data.selected]);

  const sync = async () => {
    
    if(loadingSync) return;
    
    setLoadingSync(true);

    const res = await fetch("api/syncContifico",
      {
        method: "POST",
        body: JSON.stringify(orderData),
      }
    );
    const dataResult = await res.json();
    const { success, documento, message }  = dataResult;
    setLoadingSync(false);
    setStatusSync(success);
    setDocument(documento);
    setMessageResult(message);

    if(!success) return;

    const orderUpdate = {
      query: ORDER_CUSTOM_ATTRIBUTE_CREATE,
      variables: { 
        input: {
          customAttributes: [
            {
              key: "document-id-contifico",
              value: documento
            }
          ],
          id: data.selected[0].id
        }
      },
    };
    
    const rest = await fetch("shopify:admin/api/graphql.json", {
      method: "POST",
      body: JSON.stringify(orderUpdate),
    });

    await rest.json();
  
  }

  return (
    <AdminAction
      primaryAction={
        identification && (
          <Button
            disabled={statusSync}
            onPress={() => {
              sync()
            }}
          >
            Sincronizar
        </Button>
        )
      }
      secondaryAction={
        <Button
          onPress={() => {
            close();
          }}
        >
          Cancelar
        </Button>
      }
      loading={loadingSync}
    >
      <BlockStack>
        {
          !loading && (
            statusSync ?  (
              <Text fontWeight="bold">
                {
                  documento ? `Orden sincronizada, número de documento: ${documento}` : `Esta orden ya se encuentra sincronizada`
                }
              </Text>
            ) : 
            !identification ? (
              <Text fontWeight="bold">La sincronización de esta orden con Contifico no es posible debido a la ausencia del número de documento del cliente.</Text>
            ) : !loadingSync && !statusSync && (
              <Text fontWeight="bold">
                {
                  messageResult ? messageResult : `¿ Desea sincronizar esta orden con Contifico ?`
                }
              </Text>
            )
          )
        }
      </BlockStack>
    </AdminAction>
  );
}
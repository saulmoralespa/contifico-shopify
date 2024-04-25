import {useEffect, useState} from 'react';
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
  // Use direct API calls to fetch data from Shopify.
  // See https://shopify.dev/docs/api/admin-graphql for more information about Shopify's GraphQL API
  useEffect(() => {
    async function getOrderInfo() {
      const getDataQuery = {
        query: `query Order($id: ID!) {
          order(id: $id) {
             name
             phone
             confirmed
             unpaid
             fullyPaid
             canMarkAsPaid
             cancelReason
             currentSubtotalLineItemsQuantity
             currentSubtotalPriceSet {
              shopMoney {
                amount
              }
            }
            currentTaxLines {
              priceSet {
                shopMoney {
                  amount
                }
              }
            }
            originalTotalAdditionalFeesSet{
              shopMoney {
                amount
              }
            }
            originalTotalDutiesSet {
              shopMoney {
                amount
              }
            }
            originalTotalPriceSet {
              shopMoney {
                amount
              }
            }
            subtotalPriceSet {
              shopMoney {
                amount
              }
            }
            totalDiscountsSet {
              shopMoney {
                amount
              }
            }
            totalPriceSet {
              shopMoney {
                amount
              }
            }
            taxLines {
              priceSet {
                shopMoney {
                  amount
                }
              }
              rate
              ratePercentage
            }
            test
            taxExempt
            subtotalLineItemsQuantity
            requiresShipping
            billingAddressMatchesShippingAddress
            displayFulfillmentStatus
            lineItems(first: 100) {
              nodes {
                id
                name
                sku
                currentQuantity,
                quantity
                product {
                  totalInventory
                }
                originalTotalSet {
                  shopMoney {
                    amount
                  }
                }
                originalUnitPriceSet {
                  shopMoney {
                    amount
                  }
                }
                discountedTotalSet {
                  shopMoney {
                    amount
                  }
                }
                totalDiscountSet {
                  shopMoney {
                    amount
                  }
                }
                taxLines {
                  priceSet {
                    shopMoney {
                      amount
                    }
                  }
                  rate
                  ratePercentage
                  title
                }
              }
            }
             customer {
              firstName
              lastName
              displayName
              email
              phone
              addresses {
                address1
                address2
                country
                province
                city
                firstName
                lastName
              }
              metafieldTypePerson: metafield(key: "custom.typeIdentification"){
                value
              }
              metafieldIdentification: metafield(key: "custom.identification"){
                value
              }
            }
            displayAddress {
              address1
              address2
            }
            customAttributes {
              key
              value
            }
          }
        }`,
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
    const status = dataResult?.success;
    setLoadingSync(false);
    setStatusSync(status);

    if(!status) return;

    const orderUpdate = {
      query: `mutation orderUpdate($input: OrderInput!) {
        orderUpdate(input: $input) {
          userErrors {
            field
            message
          }
        }
      }`,
      variables: { 
        input: {
          customAttributes: [
            {
              key: "document-id-contifico",
              value: "true"
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
              <Text fontWeight="bold">Esta orden ya se encuentra sincronizada</Text>
            ) : 
            !identification ? (
              <Text fontWeight="bold">La sincronización de esta orden con Contifico no es posible debido a la ausencia del número de documento del cliente.</Text>
            ) : !loadingSync && !statusSync && (
              <Text fontWeight="bold">¿ Desea sincronizar esta orden con Contifico ?</Text>
            )
          )
        }
      </BlockStack>
    </AdminAction>
  );
}
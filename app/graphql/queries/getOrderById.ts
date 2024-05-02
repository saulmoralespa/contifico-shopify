import gql from "graphql-tag";

export const GET_ORDER_BY_ID_QUERY = gql`
  query Order($id: ID!) {
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
      originalTotalAdditionalFeesSet {
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
          currentQuantity
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
      shippingLine {
        code
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
        metafieldTypePerson: metafield(key: "adv_reg.typeIdentification") {
          value
        }
        metafieldIdentification: metafield(key: "adv_reg.identification") {
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
  }
`;

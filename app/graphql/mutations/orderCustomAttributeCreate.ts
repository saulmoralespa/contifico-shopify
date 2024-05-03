
export const ORDER_CUSTOM_ATTRIBUTE_CREATE = `
  mutation orderUpdate($input: OrderInput!) {
    orderUpdate(input: $input) {
      userErrors {
        field
        message
      }
    }
  }
`;

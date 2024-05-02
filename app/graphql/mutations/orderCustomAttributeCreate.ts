import gql from "graphql-tag";

export const ORDER_CUSTOM_ATTRIBUTE_CREATE = gql`
  mutation orderUpdate($input: OrderInput!) {
    orderUpdate(input: $input) {
      userErrors {
        field
        message
      }
    }
  }
`;

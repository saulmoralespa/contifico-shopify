import { useState } from 'react';
import {
  useTranslate,
  reactExtension,
  BlockStack,
  Heading,
  TextField,
  useApplyMetafieldsChange,
  useExtensionCapability,
  useAppMetafields,
  useBuyerJourneyIntercept
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.contact.render-after',
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate();
  const [cedula, setCedula] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const canBlockProgress = useExtensionCapability("block_progress");
  const numberPattern = /^\d+$/;

  const metafieldNamespace = "custom";
  const metafieldKey = "identification";

  const metafield = useAppMetafields({
    namespace: metafieldNamespace,
    key: metafieldKey
  });

  const applyMetafieldsChange = useApplyMetafieldsChange();

  const isCedulaValid = () => {
    return numberPattern.test(cedula);
  }

  const clearValidationErrors = () => {
    setErrorMessage('');
  }

  const updateMetafield = async(value:string) => {
    setCedula(value);
    await applyMetafieldsChange({
      type: "updateMetafield",
      namespace: metafieldNamespace,
      key: metafieldKey,
      valueType: "string",
      value,
    });
  }


  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    // [START client-validation.block-progress]
    // Validate that the age of the buyer is known, and that they're old enough to complete the purchase
    if (canBlockProgress && !cedula) {
      return {
        behavior: "block",
        reason: "Cédula is required",
        // [START client-validation.field-validation-error]
        perform: (result) => {
          // If progress can be blocked, then set a validation error on the custom field
          if (result.behavior === "block") {
            setErrorMessage(translate('required'));
          }
        },
        // [END client-validation.field-validation-error]
      };
    }
    // [END client-validation.buyer-journey-intercept]

    if (canBlockProgress && !isCedulaValid()) {
      return {
        behavior: "block",
        reason: `Cédula is not valid`,
        perform: (result) => {
          // If progress can be blocked, then set a validation error on the custom field
          if (result.behavior === "block") {
            setErrorMessage(translate('validateIsNumber'));
          }
        },
        // [END client-validation.checkout-validation-error]
      };
    }
    // [END client-validation.block-progress]
    // [START client-validation.allow-progress]

    return {
      behavior: "allow",
      perform: () => {
        // Ensure any errors are hidden
        clearValidationErrors();
      },
    };
  });

  return (
    !metafield.length && (
      <BlockStack>
        <Heading>Cédula</Heading>
        <TextField
          label={translate('cedula')}
          required={canBlockProgress}
          icon={{ source: "profile", position: "end" }}
          maxLength={13}
          onInput={clearValidationErrors}
          onChange={(value) => updateMetafield(value)}
          error={errorMessage}
          value={cedula}
        />
    </BlockStack>
    )
  );
}
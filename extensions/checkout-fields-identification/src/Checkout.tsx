import { useState } from 'react';
import {
  useTranslate,
  reactExtension,
  BlockStack,
  Heading,
  TextField,
  Select,
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
  const [document, setDocument] = useState('');
  const [typePerson, setTypePerson] = useState('Natural');
  const [errorMessage, setErrorMessage] = useState('');
  const canBlockProgress = useExtensionCapability("block_progress");

  const metafieldNamespace = "custom";
  const metafieldKeyTypePerson = "typeIdentification";
  const metafieldKeyIdentification = "identification";

  const metafieldIdentification = useAppMetafields({
    namespace: metafieldNamespace,
    key: metafieldKeyIdentification
  });

  const applyMetafieldsChange = useApplyMetafieldsChange();

  const isDocumentValid = () => {
    const numberPattern = typePerson === 'Natural' ? /^\d+$/ : /^(0[0-9]|1[0-9]|2[0-4])\d{8}001$/;
    return numberPattern.test(document);
  }

  const clearValidationErrors = () => {
    setErrorMessage('');
  }

  const updateMetafieldIdentification  = async(value:string) => {
    setDocument(value);
    await applyMetafieldsChange({
      type: "updateMetafield",
      namespace: metafieldNamespace,
      key: metafieldKeyIdentification,
      valueType: "string",
      value,
    });
  }

  const updateMetafieldTypePerson = async(value:string) => {
    setTypePerson(value);
    await applyMetafieldsChange({
      type: "updateMetafield",
      namespace: metafieldNamespace,
      key: metafieldKeyTypePerson,
      valueType: "json_string",
      value: JSON.stringify([value]),
    });
  }

  const typePeople = ['Natural', 'Juridica'];
  const labelDocument = typePerson === 'Natural' ? translate('cedula') : translate('ruc');
  const requiredDocument = typePerson === 'Natural' ? translate('requiredCedula') : translate('requiredRuc');
  const transDocument = typePerson === 'Natural' ? 'cédula' : 'RUC';


  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    // [START client-validation.block-progress]
    // Validate that the age of the buyer is known, and that they're old enough to complete the purchase
    if (canBlockProgress && !document) {
      return {
        behavior: "block",
        reason: "Cédula is required",
        // [START client-validation.field-validation-error]
        perform: (result) => {
          // If progress can be blocked, then set a validation error on the custom field
          if (result.behavior === "block") {
            setErrorMessage(requiredDocument);
          }
        },
        // [END client-validation.field-validation-error]
      };
    }
    // [END client-validation.buyer-journey-intercept]

    if (canBlockProgress && !isDocumentValid()) { 
      return {
        behavior: "block",
        reason: `Cédula is not valid`,
        perform: (result) => {
          // If progress can be blocked, then set a validation error on the custom field
          if (result.behavior === "block") {
            setErrorMessage(translate('validateIsNumber', {
              document:transDocument
            }));
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
    !metafieldIdentification.length && (
      <BlockStack>
        <Heading>{translate('typePerson')}</Heading>
        <Select
          label={translate('typePerson')}
          required={true}
          onChange={(value) => updateMetafieldTypePerson(value)}
          value={typePerson}
          options={typePeople.map(person => ({
            value: person,
            label: person
          }))}
        />
        <Heading>{labelDocument}</Heading>
        <TextField
          label={labelDocument}
          required={canBlockProgress}
          icon={{ source: "profile", position: "end" }}
          maxLength={13}
          onInput={clearValidationErrors}
          onChange={(value) => updateMetafieldIdentification(value)}
          error={errorMessage}
          value={document}
        />
    </BlockStack>
    )
  );
}
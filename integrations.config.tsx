import React from "react";

const integrations = {
  isSanityEnabled: true,
  isStripeEnabled: true,
  isAlgoliaEnabled: true,
  isMailchimpEnabled: true,
  isAuthEnabled: true,
};

const messages = {
  sanity: (
    <div style={{ whiteSpace: "pre-wrap" }}>
      Sanity is not enabled. Follow the{" "}
      <a
        href="https://nextjstemplates.com/docs/enableintegration"
        className="text-primary underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        documentation
      </a>{" "}
      to enable it.
    </div>
  ),
  stripe: (
    <div style={{ whiteSpace: "pre-wrap" }}>
      Stripe is not enabled. Follow the{" "}
      <a
        href="https://nextjstemplates.com/docs/enableintegration"
        className="text-primary underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        documentation
      </a>{" "}
      to enable it.
    </div>
  ),
  algolia: (
    <div style={{ whiteSpace: "pre-wrap" }}>
      Algolia is not enabled. Follow the{" "}
      <a
        href="https://nextjstemplates.com/docs/enableintegration"
        className="text-primary underline"
      >
        documentation
      </a>{" "}
      to enable it.
    </div>
  ),
  mailchimp: (
    <div style={{ whiteSpace: "pre-wrap" }}>
      Mailchimp is not enabled. Follow the {""}
      <a
        href="https://nextjstemplates.com/docs/enableintegration"
        className="text-primary underline"
      >
        documentation
      </a>{" "}
      to enable it.
    </div>
  ),
  auth: (
    <div style={{ whiteSpace: "pre-wrap" }}>
      Auth is not enabled. Follow the{" "}
      <a
        href="https://nextjstemplates.com/docs/enableintegration"
        className="text-primary underline"
      >
        documentation
      </a>{" "}
      to enable it.
    </div>
  ),

  // Add more messages here
};

export { integrations, messages };

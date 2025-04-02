
import React from "react";
import SipConfigurationContainer from "./sip-config/SipConfigurationContainer";

const SipConfiguration = () => {
  return <SipConfigurationContainer />;
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export default React.memo(SipConfiguration);

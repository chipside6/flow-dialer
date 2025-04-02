
import React from "react";
import SipConfigurationContainer from "./sip-config/SipConfigurationContainer";

const SipConfiguration = () => {
  // Wrap the component with React.memo to prevent unnecessary re-renders
  return React.memo(() => (
    <SipConfigurationContainer />
  ))();
};

export default SipConfiguration;

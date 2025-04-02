
import React, { useState, useEffect } from "react";
import EnvironmentSetup from "./sip-config/EnvironmentSetup";
import ProviderConfiguration from "./sip-config/ProviderConfiguration";

const SipConfiguration = () => {
  // Initialize state with env variables, fallback to empty strings for production
  const [apiUrl, setApiUrl] = useState(
    import.meta.env.VITE_ASTERISK_API_URL || ""
  );
  const [username, setUsername] = useState(
    import.meta.env.VITE_ASTERISK_API_USERNAME || ""
  );
  const [password, setPassword] = useState(
    import.meta.env.VITE_ASTERISK_API_PASSWORD || ""
  );
  const [providerName, setProviderName] = useState("my-sip-provider");
  const [host, setHost] = useState("sip.provider.com");
  const [port, setPort] = useState("5060");
  const [providerUsername, setProviderUsername] = useState("sipuser");
  const [providerPassword, setProviderPassword] = useState("sippassword");

  return (
    <div className="space-y-6">
      <EnvironmentSetup 
        apiUrl={apiUrl}
        username={username}
        password={password}
        setApiUrl={setApiUrl}
        setUsername={setUsername}
        setPassword={setPassword}
      />
      
      <ProviderConfiguration
        providerName={providerName}
        host={host}
        port={port}
        providerUsername={providerUsername}
        providerPassword={providerPassword}
        setProviderName={setProviderName}
        setHost={setHost}
        setPort={setPort}
        setProviderUsername={setProviderUsername}
        setProviderPassword={setProviderPassword}
      />
    </div>
  );
};

export default SipConfiguration;

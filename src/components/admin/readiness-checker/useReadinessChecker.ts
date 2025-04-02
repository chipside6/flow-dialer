import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast"
import { apiFetch } from '@/services/api/apiConfig';

interface ReadinessCheckResult {
  checks: {
    database: {
      status: boolean;
      message?: string;
      error?: string;
    };
    redis: {
      status: boolean;
      message?: string;
      error?: string;
    };
    asterisk: {
      status: boolean;
      message?: string;
      error?: string;
    };
    internet: {
      status: boolean;
      message?: string;
      error?: string;
    };
    outboundCalls: {
      status: boolean;
      message?: string;
      error?: string;
    };
  };
  overallStatus: boolean;
}

interface EnvironmentVariableCheckResult {
  status: boolean;
  message?: string;
  error?: string;
  variable?: string;
}

interface EnvironmentVariableReadinessCheckResult {
  checks: {
    apiUrl: EnvironmentVariableCheckResult;
    username: EnvironmentVariableCheckResult;
    password: EnvironmentVariableCheckResult;
  };
  overallStatus: boolean;
}

interface SipTrunkCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface SipTrunkReadinessCheckResult {
  checks: {
    registration: SipTrunkCheckResult;
    optionsPings: SipTrunkCheckResult;
    outboundCalls: SipTrunkCheckResult;
  };
  overallStatus: boolean;
}

interface DnsResolutionCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface DnsResolutionReadinessCheckResult {
  checks: {
    primaryDns: DnsResolutionCheckResult;
    secondaryDns: DnsResolutionCheckResult;
  };
  overallStatus: boolean;
}

interface FirewallCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface FirewallReadinessCheckResult {
  checks: {
    sipPort: FirewallCheckResult;
    rtpPortRange: FirewallCheckResult;
  };
  overallStatus: boolean;
}

interface PerformanceCheckResult {
  status: boolean;
  message?: string;
  error?: string;
  latency?: number;
  jitter?: number;
  packetLoss?: number;
}

interface PerformanceReadinessCheckResult {
  checks: {
    networkLatency: PerformanceCheckResult;
    jitter: PerformanceCheckResult;
    packetLoss: PerformanceCheckResult;
  };
  overallStatus: boolean;
}

interface SecurityCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface SecurityReadinessCheckResult {
  checks: {
    firewall: SecurityCheckResult;
    tls: SecurityCheckResult;
    encryption: SecurityCheckResult;
  };
  overallStatus: boolean;
}

interface MonitoringCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface MonitoringReadinessCheckResult {
  checks: {
    resourceUtilization: MonitoringCheckResult;
    processMonitoring: MonitoringCheckResult;
    logAggregation: MonitoringCheckResult;
  };
  overallStatus: boolean;
}

interface BackupAndRecoveryCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface BackupAndRecoveryReadinessCheckResult {
  checks: {
    regularBackups: BackupAndRecoveryCheckResult;
    recoveryPlan: BackupAndRecoveryCheckResult;
    disasterRecovery: BackupAndRecoveryCheckResult;
  };
  overallStatus: boolean;
}

interface ScalabilityCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface ScalabilityReadinessCheckResult {
  checks: {
    horizontalScaling: ScalabilityCheckResult;
    loadBalancing: ScalabilityCheckResult;
    autoScaling: ScalabilityCheckResult;
  };
  overallStatus: boolean;
}

interface HighAvailabilityCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface HighAvailabilityReadinessCheckResult {
  checks: {
    redundancy: HighAvailabilityCheckResult;
    failover: HighAvailabilityCheckResult;
    automaticRecovery: HighAvailabilityCheckResult;
  };
  overallStatus: boolean;
}

interface CapacityPlanningCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface CapacityPlanningReadinessCheckResult {
  checks: {
    resourceForecasting: CapacityPlanningCheckResult;
    scalabilityTesting: CapacityPlanningCheckResult;
    performanceOptimization: CapacityPlanningCheckResult;
  };
  overallStatus: boolean;
}

interface ComplianceCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface ComplianceReadinessCheckResult {
  checks: {
    dataProtection: ComplianceCheckResult;
    securityStandards: ComplianceCheckResult;
    regulatoryCompliance: ComplianceCheckResult;
  };
  overallStatus: boolean;
}

interface LoggingCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface LoggingReadinessCheckResult {
  checks: {
    centralizedLogging: LoggingCheckResult;
    logRetention: LoggingCheckResult;
    logAnalysis: LoggingCheckResult;
  };
  overallStatus: boolean;
}

interface AlertingCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface AlertingReadinessCheckResult {
  checks: {
    thresholdBasedAlerts: AlertingCheckResult;
    anomalyDetection: AlertingCheckResult;
    escalationPolicies: AlertingCheckResult;
  };
  overallStatus: boolean;
}

interface DisasterRecoveryCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface DisasterRecoveryReadinessCheckResult {
  checks: {
    failoverTesting: DisasterRecoveryCheckResult;
    dataReplication: DisasterRecoveryCheckResult;
    recoveryTimeObjective: DisasterRecoveryCheckResult;
  };
  overallStatus: boolean;
}

interface SecurityAuditsCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface SecurityAuditsReadinessCheckResult {
  checks: {
    vulnerabilityScanning: SecurityAuditsCheckResult;
    penetrationTesting: SecurityAuditsCheckResult;
    securityAssessments: SecurityAuditsCheckResult;
  };
  overallStatus: boolean;
}

interface ConfigurationManagementCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface ConfigurationManagementReadinessCheckResult {
  checks: {
    versionControl: ConfigurationManagementCheckResult;
    infrastructureAsCode: ConfigurationManagementCheckResult;
    automatedConfiguration: ConfigurationManagementCheckResult;
  };
  overallStatus: boolean;
}

interface MonitoringToolsCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface MonitoringToolsReadinessCheckResult {
  checks: {
    systemMonitoring: MonitoringToolsCheckResult;
    applicationMonitoring: MonitoringToolsCheckResult;
    networkMonitoring: MonitoringToolsCheckResult;
  };
  overallStatus: boolean;
}

interface PerformanceTestingCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface PerformanceTestingReadinessCheckResult {
  checks: {
    loadTesting: PerformanceTestingCheckResult;
    stressTesting: PerformanceTestingCheckResult;
    enduranceTesting: PerformanceTestingCheckResult;
  };
  overallStatus: boolean;
}

interface CapacityPlanningToolsCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface CapacityPlanningToolsReadinessCheckResult {
  checks: {
    resourceAnalysis: CapacityPlanningToolsCheckResult;
    trendAnalysis: CapacityPlanningToolsCheckResult;
    predictiveAnalysis: CapacityPlanningToolsCheckResult;
  };
  overallStatus: boolean;
}

interface SecurityToolsCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface SecurityToolsReadinessCheckResult {
  checks: {
    intrusionDetection: SecurityToolsCheckResult;
    intrusionPrevention: SecurityToolsCheckResult;
    securityInformation: SecurityToolsCheckResult;
  };
  overallStatus: boolean;
}

interface ComplianceAutomationCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface ComplianceAutomationReadinessCheckResult {
  checks: {
    policyEnforcement: ComplianceAutomationCheckResult;
    auditTrails: ComplianceAutomationCheckResult;
    reporting: ComplianceAutomationCheckResult;
  };
  overallStatus: boolean;
}

interface LoggingToolsCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface LoggingToolsReadinessCheckResult {
  checks: {
    logCollection: LoggingToolsCheckResult;
    logStorage: LoggingToolsCheckResult;
    logAnalysisTools: LoggingToolsCheckResult;
  };
  overallStatus: boolean;
}

interface AlertingToolsCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface AlertingToolsReadinessCheckResult {
  checks: {
    alertConfiguration: AlertingToolsCheckResult;
    notificationChannels: AlertingToolsCheckResult;
    responseAutomation: AlertingToolsCheckResult;
  };
  overallStatus: boolean;
}

interface DisasterRecoveryToolsCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface DisasterRecoveryToolsReadinessCheckResult {
  checks: {
    replicationTools: DisasterRecoveryToolsCheckResult;
    failoverAutomation: DisasterRecoveryToolsCheckResult;
    recoveryValidation: DisasterRecoveryToolsCheckResult;
  };
  overallStatus: boolean;
}

interface SecurityAuditsToolsCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface SecurityAuditsToolsReadinessCheckResult {
  checks: {
    scanningTools: SecurityAuditsToolsCheckResult;
    testingTools: SecurityAuditsToolsCheckResult;
    assessmentTools: SecurityAuditsToolsCheckResult;
  };
  overallStatus: boolean;
}

interface ConfigurationManagementToolsCheckResult {
  status: boolean;
  message?: string;
  error?: string;
}

interface ConfigurationManagementToolsReadinessCheckResult {
  checks: {
    versionControlTools: ConfigurationManagementToolsCheckResult;
    iacTools: ConfigurationManagementToolsCheckResult;
    automationTools: ConfigurationManagementToolsCheckResult;
  };
  overallStatus: boolean;
}

const useReadinessChecker = () => {
  const [readiness, setReadiness] = useState<ReadinessCheckResult | null>(null);
  const [envVarsReadiness, setEnvVarsReadiness] = useState<EnvironmentVariableReadinessCheckResult | null>(null);
  const [sipTrunkReadiness, setSipTrunkReadiness] = useState<SipTrunkReadinessCheckResult | null>(null);
  const [dnsResolutionReadiness, setDnsResolutionReadiness] = useState<DnsResolutionReadinessCheckResult | null>(null);
  const [firewallReadiness, setFirewallReadiness] = useState<FirewallReadinessCheckResult | null>(null);
  const [performanceReadiness, setPerformanceReadiness] = useState<PerformanceReadinessCheckResult | null>(null);
  const [securityReadiness, setSecurityReadiness] = useState<SecurityReadinessCheckResult | null>(null);
  const [monitoringReadiness, setMonitoringReadiness] = useState<MonitoringReadinessCheckResult | null>(null);
  const [backupAndRecoveryReadiness, setBackupAndRecoveryReadiness] = useState<BackupAndRecoveryReadinessCheckResult | null>(null);
  const [scalabilityReadiness, setScalabilityReadiness] = useState<ScalabilityReadinessCheckResult | null>(null);
  const [highAvailabilityReadiness, setHighAvailabilityReadiness] = useState<HighAvailabilityReadinessCheckResult | null>(null);
  const [capacityPlanningReadiness, setCapacityPlanningReadiness] = useState<CapacityPlanningReadinessCheckResult | null>(null);
  const [complianceReadiness, setComplianceReadiness] = useState<ComplianceReadinessCheckResult | null>(null);
  const [loggingReadiness, setLoggingReadiness] = useState<LoggingReadinessCheckResult | null>(null);
  const [alertingReadiness, setAlertingReadiness] = useState<AlertingReadinessCheckResult | null>(null);
  const [disasterRecoveryReadiness, setDisasterRecoveryReadiness] = useState<DisasterRecoveryReadinessCheckResult | null>(null);
  const [securityAuditsReadiness, setSecurityAuditsReadiness] = useState<SecurityAuditsReadinessCheckResult | null>(null);
  const [configurationManagementReadiness, setConfigurationManagementReadiness] = useState<ConfigurationManagementReadinessCheckResult | null>(null);
  const [monitoringToolsReadiness, setMonitoringToolsReadiness] = useState<MonitoringToolsReadinessCheckResult | null>(null);
  const [performanceTestingReadiness, setPerformanceTestingReadiness] = useState<PerformanceTestingReadinessCheckResult | null>(null);
  const [capacityPlanningToolsReadiness, setCapacityPlanningToolsReadiness] = useState<CapacityPlanningToolsReadinessCheckResult | null>(null);
  const [securityToolsReadiness, setSecurityToolsReadiness] = useState<SecurityToolsReadinessCheckResult | null>(null);
  const [complianceAutomationReadiness, setComplianceAutomationReadiness] = useState<ComplianceAutomationReadinessCheckResult | null>(null);
  const [loggingToolsReadiness, setLoggingToolsReadiness] = useState<LoggingToolsReadinessCheckResult | null>(null);
  const [alertingToolsReadiness, setAlertingToolsReadiness] = useState<AlertingToolsReadinessCheckResult | null>(null);
  const [disasterRecoveryToolsReadiness, setDisasterRecoveryToolsReadiness] = useState<DisasterRecoveryToolsReadinessCheckResult | null>(null);
  const [securityAuditsToolsReadiness, setSecurityAuditsToolsReadiness] = useState<SecurityAuditsToolsReadinessCheckResult | null>(null);
  const [configurationManagementToolsReadiness, setConfigurationManagementToolsReadiness] = useState<ConfigurationManagementToolsReadinessCheckResult | null>(null);
  const { toast } = useToast()

  const checkReadiness = async () => {
    try {
      const result = await apiFetch<ReadinessCheckResult>('admin/readiness');
        setReadiness(result);
        toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch readiness",
        variant: "destructive",
      })
    }
  };

  const checkEnvironmentVariables = async () => {
    try {
      const result = await apiFetch<EnvironmentVariableReadinessCheckResult>('admin/readiness/env-vars');
      setEnvVarsReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch environment variables readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch environment variables readiness",
        variant: "destructive",
      })
    }
  };

  const checkSipTrunk = async () => {
    try {
      const result = await apiFetch<SipTrunkReadinessCheckResult>('admin/readiness/sip-trunk');
      setSipTrunkReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch SIP trunk readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch SIP trunk readiness",
        variant: "destructive",
      })
    }
  };

  const checkDnsResolution = async () => {
    try {
      const result = await apiFetch<DnsResolutionReadinessCheckResult>('admin/readiness/dns-resolution');
      setDnsResolutionReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch DNS resolution readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch DNS resolution readiness",
        variant: "destructive",
      })
    }
  };

  const checkFirewall = async () => {
    try {
      const result = await apiFetch<FirewallReadinessCheckResult>('admin/readiness/firewall');
      setFirewallReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch firewall readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch firewall readiness",
        variant: "destructive",
      })
    }
  };

  const checkPerformance = async () => {
    try {
      const result = await apiFetch<PerformanceReadinessCheckResult>('admin/readiness/performance');
      setPerformanceReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch performance readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch performance readiness",
        variant: "destructive",
      })
    }
  };

  const checkSecurity = async () => {
    try {
      const result = await apiFetch<SecurityReadinessCheckResult>('admin/readiness/security');
      setSecurityReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch security readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch security readiness",
        variant: "destructive",
      })
    }
  };

  const checkMonitoring = async () => {
    try {
      const result = await apiFetch<MonitoringReadinessCheckResult>('admin/readiness/monitoring');
      setMonitoringReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch monitoring readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch monitoring readiness",
        variant: "destructive",
      })
    }
  };

  const checkBackupAndRecovery = async () => {
    try {
      const result = await apiFetch<BackupAndRecoveryReadinessCheckResult>('admin/readiness/backup-and-recovery');
      setBackupAndRecoveryReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch backup and recovery readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch backup and recovery readiness",
        variant: "destructive",
      })
    }
  };

  const checkScalability = async () => {
    try {
      const result = await apiFetch<ScalabilityReadinessCheckResult>('admin/readiness/scalability');
      setScalabilityReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch scalability readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch scalability readiness",
        variant: "destructive",
      })
    }
  };

  const checkHighAvailability = async () => {
    try {
      const result = await apiFetch<HighAvailabilityReadinessCheckResult>('admin/readiness/high-availability');
      setHighAvailabilityReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch high availability readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch high availability readiness",
        variant: "destructive",
      })
    }
  };

  const checkCapacityPlanning = async () => {
    try {
      const result = await apiFetch<CapacityPlanningReadinessCheckResult>('admin/readiness/capacity-planning');
      setCapacityPlanningReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch capacity planning readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch capacity planning readiness",
        variant: "destructive",
      })
    }
  };

  const checkCompliance = async () => {
    try {
      const result = await apiFetch<ComplianceReadinessCheckResult>('admin/readiness/compliance');
      setComplianceReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch compliance readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch compliance readiness",
        variant: "destructive",
      })
    }
  };

  const checkLogging = async () => {
    try {
      const result = await apiFetch<LoggingReadinessCheckResult>('admin/readiness/logging');
      setLoggingReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch logging readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch logging readiness",
        variant: "destructive",
      })
    }
  };

  const checkAlerting = async () => {
    try {
      const result = await apiFetch<AlertingReadinessCheckResult>('admin/readiness/alerting');
      setAlertingReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch alerting readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch alerting readiness",
        variant: "destructive",
      })
    }
  };

  const checkDisasterRecovery = async () => {
    try {
      const result = await apiFetch<DisasterRecoveryReadinessCheckResult>('admin/readiness/disaster-recovery');
      setDisasterRecoveryReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch disaster recovery readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch disaster recovery readiness",
        variant: "destructive",
      })
    }
  };

  const checkSecurityAudits = async () => {
    try {
      const result = await apiFetch<SecurityAuditsReadinessCheckResult>('admin/readiness/security-audits');
      setSecurityAuditsReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch security audits readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch security audits readiness",
        variant: "destructive",
      })
    }
  };

  const checkConfigurationManagement = async () => {
    try {
      const result = await apiFetch<ConfigurationManagementReadinessCheckResult>('admin/readiness/configuration-management');
      setConfigurationManagementReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch configuration management readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch configuration management readiness",
        variant: "destructive",
      })
    }
  };

    const checkMonitoringTools = async () => {
    try {
      const result = await apiFetch<MonitoringToolsReadinessCheckResult>('admin/readiness/monitoring-tools');
      setMonitoringToolsReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch monitoring tools readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch monitoring tools readiness",
        variant: "destructive",
      })
    }
  };

  const checkPerformanceTesting = async () => {
    try {
      const result = await apiFetch<PerformanceTestingReadinessCheckResult>('admin/readiness/performance-testing');
      setPerformanceTestingReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch performance testing readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch performance testing readiness",
        variant: "destructive",
      })
    }
  };

  const checkCapacityPlanningTools = async () => {
    try {
      const result = await apiFetch<CapacityPlanningToolsReadinessCheckResult>('admin/readiness/capacity-planning-tools');
      setCapacityPlanningToolsReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch capacity planning tools readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch capacity planning tools readiness",
        variant: "destructive",
      })
    }
  };

  const checkSecurityTools = async () => {
    try {
      const result = await apiFetch<SecurityToolsReadinessCheckResult>('admin/readiness/security-tools');
      setSecurityToolsReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch security tools readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch security tools readiness",
        variant: "destructive",
      })
    }
  };

  const checkComplianceAutomation = async () => {
    try {
      const result = await apiFetch<ComplianceAutomationReadinessCheckResult>('admin/readiness/compliance-automation');
      setComplianceAutomationReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch compliance automation readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch compliance automation readiness",
        variant: "destructive",
      })
    }
  };

  const checkLoggingTools = async () => {
    try {
      const result = await apiFetch<LoggingToolsReadinessCheckResult>('admin/readiness/logging-tools');
      setLoggingToolsReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch logging tools readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch logging tools readiness",
        variant: "destructive",
      })
    }
  };

  const checkAlertingTools = async () => {
    try {
      const result = await apiFetch<AlertingToolsReadinessCheckResult>('admin/readiness/alerting-tools');
      setAlertingToolsReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch alerting tools readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch alerting tools readiness",
        variant: "destructive",
      })
    }
  };

  const checkDisasterRecoveryTools = async () => {
    try {
      const result = await apiFetch<DisasterRecoveryToolsReadinessCheckResult>('admin/readiness/disaster-recovery-tools');
      setDisasterRecoveryToolsReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch disaster recovery tools readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch disaster recovery tools readiness",
        variant: "destructive",
      })
    }
  };

  const checkSecurityAuditsTools = async () => {
    try {
      const result = await apiFetch<SecurityAuditsToolsReadinessCheckResult>('admin/readiness/security-audits-tools');
      setSecurityAuditsToolsReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch security audits tools readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch security audits tools readiness",
        variant: "destructive",
      })
    }
  };

  const checkConfigurationManagementTools = async () => {
    try {
      const result = await apiFetch<ConfigurationManagementToolsReadinessCheckResult>('admin/readiness/configuration-management-tools');
      setConfigurationManagementToolsReadiness(result);
      toast({ title: "Success", description: result.message || (result.error ? `Error: ${result.error}` : "Operation completed successfully") });
    } catch (error: any) {
      console.error("Failed to fetch configuration management tools readiness:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch configuration management tools readiness",
        variant: "destructive",
      })
    }
  };

  useEffect(() => {
    checkReadiness();
    checkEnvironmentVariables();
    checkSipTrunk();
    checkDnsResolution();
    checkFirewall();
    checkPerformance();
    checkSecurity();
    checkMonitoring();
    checkBackupAndRecovery();
    checkScalability();
    checkHighAvailability();
    checkCapacityPlanning();
    checkCompliance();
    checkLogging();
    checkAlerting();
    checkDisasterRecovery();
    checkSecurityAudits();
    checkConfigurationManagement();
    checkMonitoringTools();
    checkPerformanceTesting();
    checkCapacityPlanningTools();
    checkSecurityTools();
    checkComplianceAutomation();
    checkLoggingTools();
    checkAlertingTools();
    checkDisasterRecoveryTools();
    checkSecurityAuditsTools();
    checkConfigurationManagementTools();
  }, []);

  return {
    readiness,
    envVarsReadiness,
    sipTrunkReadiness,
    dnsResolutionReadiness,
    firewallReadiness,
    performanceReadiness,
    securityReadiness,
    monitoringReadiness,
    backupAndRecoveryReadiness,
    scalabilityReadiness,
    highAvailabilityReadiness,
    capacityPlanningReadiness,
    complianceReadiness,
    loggingReadiness,
    alertingReadiness,
    disasterRecoveryReadiness,
    securityAuditsReadiness,
    configurationManagementReadiness,
    monitoringToolsReadiness,
    performanceTestingReadiness,
    capacityPlanningToolsReadiness,
    securityToolsReadiness,
    complianceAutomationReadiness,
    loggingToolsReadiness,
    alertingToolsReadiness,
    disasterRecoveryToolsReadiness,
    securityAuditsToolsReadiness,
    configurationManagementToolsReadiness,
    checkReadiness,
    checkEnvironmentVariables,
    checkSipTrunk,
    checkDnsResolution,
    checkFirewall,
    checkPerformance,
    checkSecurity,
    checkMonitoring,
    checkBackupAndRecovery,
    checkScalability,
    checkHighAvailability,
    checkCapacityPlanning,
    checkCompliance,
    checkLogging,
    checkAlerting,
    checkDisasterRecovery,
    checkSecurityAudits,
    checkConfigurationManagement,
    checkMonitoringTools,
    checkPerformanceTesting,
    checkCapacityPlanningTools,
    checkSecurityTools,
    checkComplianceAutomation,
    checkLoggingTools,

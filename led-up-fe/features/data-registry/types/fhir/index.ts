import * as Common from './common';
import * as Patient from './patient';
import * as Procedure from './procedure';
import * as Condition from './condition';
import * as Encounter from './encounter';
import * as Observation from './observation';
import * as MedicationStatement from './medication-statement';
import * as MedicationRequest from './medication-request';
import * as FamilyHistory from './family-history';
import * as Immunization from './immunization';
import * as AllergyIntolerance from './allergy-intolerance';
import * as SocialHistory from './basic';
import * as CarePlan from './care-plan';
import * as Basic from './basic';
import * as AdverseEvent from './adverse-event';
// import * as Appointment from './appointment';
// import * as DiagnosticReport from './diagnostic-report';
// import * as Medication from './medication';

export default {
  Common,
  Patient,
  Procedure,
  Condition,
  Encounter,
  Observation,
  MedicationStatement,
  MedicationRequest,
  FamilyHistory,
  Immunization,
  AllergyIntolerance,
  SocialHistory,
  CarePlan,
  Basic,
  AdverseEvent,
  // Appointment,
  // DiagnosticReport,
  // Medication,
};

export * from './common';
export * from './patient';
export * from './procedure';
export * from './condition';
export * from './encounter';
export * from './observation';
export * from './medication-statement';
export * from './medication-request';
export * from './family-history';
export * from './immunization';
export * from './allergy-intolerance';
export * from './basic';
export * from './care-plan';
export * from './adverse-event';
// export * from './appointment';
// export * from './diagnostic-report';
// export * from './medication';

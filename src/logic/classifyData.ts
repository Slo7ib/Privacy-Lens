// Here i will be defining a category that should be connected to the react component to render the elemnts based on the response from the api
import type { SectionName } from "../app/types/sections";
import type { LucideIcon } from "lucide-react";
import {
  Phone,
  KeyRound,
  UserRound,
  Mail,
  History,
  Link,
  Cookie,
  HouseWifi,
  MonitorSmartphone,
  CreditCard,
  DollarSign,
  Calendar,
  Contact,
  Fingerprint,
} from "lucide-react";

export interface CollectedCategory {
  section: SectionName;
  element: string;
  collected: boolean;
  icon: LucideIcon;
  key: number;
  question: string;
}

export const dataCollectionItems: CollectedCategory[] = [
  {
    key: 1,
    element: "Phone Number",
    collected: false,
    icon: Phone,
    section: "Personal Identifiers",
    question:
      "Does the privacy policy state that the website collects or stores the user's phone number?",
  },
  {
    key: 2,
    element: "Account Credentials",
    collected: false,
    icon: KeyRound,
    section: "Personal Identifiers",
    question:
      "Does the privacy policy indicate that the website collects or stores account credentials such as usernames or passwords?",
  },
  {
    key: 3,
    element: "Personal Information",
    collected: false,
    icon: UserRound,
    section: "Personal Identifiers",
    question:
      "Does the privacy policy mention collecting or storing personal information such as name, age, or identity details?",
  },
  {
    key: 4,
    element: "Email",
    collected: false,
    icon: Mail,
    section: "Personal Identifiers",
    question:
      "Does the privacy policy state that the website collects or stores the user's email address?",
  },
  {
    key: 5,
    element: "Links clicked",
    collected: false,
    icon: Link,
    section: "Online Activity",
    question:
      "Does the privacy policy indicate that the website tracks or records the links a user clicks?",
  },
  {
    key: 6,
    element: "Pages visited",
    collected: false,
    icon: History,
    section: "Online Activity",
    question:
      "Does the privacy policy state that the website tracks or logs the pages a user visits?",
  },
  {
    key: 7,
    element: "Cookie usage",
    collected: false,
    icon: Cookie,
    section: "Online Activity",
    question:
      "Does the privacy policy mention collecting data through cookies or similar tracking technologies?",
  },
  {
    key: 8,
    element: "Device Type",
    collected: false,
    icon: MonitorSmartphone,
    section: "Device Data",
    question:
      "Does the privacy policy indicate that the website collects information about the users device type?",
  },
  {
    key: 9,
    element: "IP Address",
    collected: false,
    icon: HouseWifi,
    section: "Device Data",
    question:
      "Does the privacy policy state that the website collects or logs the users IP address?",
  },
  {
    key: 10,
    element: "Payment Information",
    collected: false,
    icon: CreditCard,
    section: "Personal Identifiers",
    question:
      "Does the privacy policy indicate that the website collects or stores payment information such as credit card or billing details?",
  },
  {
    key: 12,
    element: "Calendar Access",
    collected: false,
    icon: Calendar,
    section: "Device Data",
    question:
      "Does the privacy policy state that the website or app accesses or collects data from the user's calendar?",
  },
  {
    key: 13,
    element: "Contact List",
    collected: false,
    icon: Contact,
    section: "Device Data",
    question:
      "Does the privacy policy mention accessing or collecting the users contacts or address book?",
  },
  {
    key: 14,
    element: "Biometric Data",
    collected: false,
    icon: Fingerprint,
    section: "Personal Identifiers",
    question:
      "Does the privacy policy indicate that the website collects or stores biometric data such as fingerprints, face scans, or other biometric identifiers?",
  },
];

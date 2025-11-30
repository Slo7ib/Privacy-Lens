// Here i will be defining a category that should be connected to the react component to render the elemnts based on the response from the api
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
} from "lucide-react";

export interface CollectedCategory {
  section: string;
  element: string;
  collected: boolean;
  icon: LucideIcon;
}

export const collectedCategories: CollectedCategory[] = [
  {
    element: "Phone Number",
    collected: true,
    icon: Phone,
    section: "Personal Identifiers",
  },
  {
    element: "Account Credentials",
    collected: false,
    icon: KeyRound,
    section: "Personal Identifiers",
  },
  {
    element: "Personal Information",
    collected: true,
    icon: UserRound,
    section: "Personal Identifiers",
  },
  {
    element: "Email",
    collected: true,
    icon: Mail,
    section: "Personal Identifiers",
  },
  {
    element: "Links clicked",
    collected: true,
    icon: Link,
    section: "Online Activity",
  },
  {
    element: "Pages visited",
    collected: false,
    icon: History,
    section: "Online Activity",
  },
  {
    element: "Cookie usage",
    collected: false,
    icon: Cookie,
    section: "Online Activity",
  },
  {
    element: "Deivce Type",
    collected: false,
    icon: MonitorSmartphone,
    section: "Device Data",
  },
  {
    element: "IP Address",
    collected: false,
    icon: HouseWifi,
    section: "Device Data",
  },
];

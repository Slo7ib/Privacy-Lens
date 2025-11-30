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
} from "lucide-react";

export interface CollectedCategory {
  section: SectionName;
  element: string;
  collected: boolean;
  icon: LucideIcon;
  key: number;
}

export const collectedCategories: CollectedCategory[] = [
  {
    key: 1,
    element: "Phone Number",
    collected: true,
    icon: Phone,
    section: "Personal Identifiers",
  },
  {
    key: 2,
    element: "Account Credentials",
    collected: false,
    icon: KeyRound,
    section: "Personal Identifiers",
  },
  {
    key: 3,
    element: "Personal Information",
    collected: true,
    icon: UserRound,
    section: "Personal Identifiers",
  },
  {
    key: 4,
    element: "Email",
    collected: true,
    icon: Mail,
    section: "Personal Identifiers",
  },
  {
    key: 5,
    element: "Links clicked",
    collected: true,
    icon: Link,
    section: "Online Activity",
  },
  {
    key: 6,
    element: "Pages visited",
    collected: false,
    icon: History,
    section: "Online Activity",
  },
  {
    key: 7,
    element: "Cookie usage",
    collected: false,
    icon: Cookie,
    section: "Online Activity",
  },
  {
    key: 8,
    element: "Deivce Type",
    collected: false,
    icon: MonitorSmartphone,
    section: "Deivce Data",
  },
  {
    key: 9,
    element: "IP Address",
    collected: false,
    icon: HouseWifi,
    section: "Deivce Data",
  },
];

"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DomainSelector = ({}) => {
  return (
    <>
      <Select>
        <SelectTrigger className="w-full max-w-[200px]">
          <SelectValue placeholder="Domain" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="finance">Finance</SelectItem>
          <SelectItem value="healthcare">Healthcare</SelectItem>
          <SelectItem value="generic">Generic</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
};

export default DomainSelector;

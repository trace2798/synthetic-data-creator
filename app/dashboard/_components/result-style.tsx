"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const ResultStyle = ({}) => {
  return (
    <>
      <Select>
        <SelectTrigger className="w-full max-w-[200px]">
          <SelectValue placeholder="Result Style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="qa">Question Answer</SelectItem>
          <SelectItem value="cot">Chain of Thought</SelectItem>
          <SelectItem value="generic">Generic</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
};

export default ResultStyle;

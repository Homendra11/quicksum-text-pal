
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ControlSectionProps {
  summaryType: string;
  tone: string;
  length: number[];
  onSummaryTypeChange: (value: string) => void;
  onToneChange: (value: string) => void;
  onLengthChange: (value: number[]) => void;
}

const ControlSection = ({
  summaryType,
  tone,
  length,
  onSummaryTypeChange,
  onToneChange,
  onLengthChange,
}: ControlSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <div>
        <label className="text-sm font-medium block mb-2">Summary Type</label>
        <Select onValueChange={onSummaryTypeChange} defaultValue={summaryType}>
          <SelectTrigger>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="bullets">Bullet Points</SelectItem>
            <SelectItem value="tldr">TL;DR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">Tone</label>
        <Select onValueChange={onToneChange} defaultValue={tone}>
          <SelectTrigger>
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="friendly">Friendly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">
          Length: {length[0]}%
        </label>
        <Slider defaultValue={length} max={100} step={10} onValueChange={onLengthChange} />
      </div>
    </div>
  );
};

export default ControlSection;

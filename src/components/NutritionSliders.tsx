import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NutritionSlidersProps {
  estimatedTime: number; // in hours
  onNext: (nutrition: NutritionPlan) => void;
  onBack: () => void;
}

export interface NutritionPlan {
  carbsPerHour: number;
  sodiumPerHour: number;
  waterPerHour: number;
  totalCarbs: number;
  totalSodium: number;
  totalWater: number;
}

const NutritionSliders: React.FC<NutritionSlidersProps> = ({
  estimatedTime,
  onNext,
  onBack,
}) => {
  const [carbsPerHour, setCarbsPerHour] = useState<number>(60);
  const [sodiumPerHour, setSodiumPerHour] = useState<number>(500);
  const [waterPerHour, setWaterPerHour] = useState<number>(500);

  const totalCarbs = Math.round(carbsPerHour * estimatedTime);
  const totalSodium = Math.round(sodiumPerHour * estimatedTime);
  const totalWater = Math.round(waterPerHour * estimatedTime);

  const handleNext = () => {
    const nutritionPlan: NutritionPlan = {
      carbsPerHour,
      sodiumPerHour,
      waterPerHour,
      totalCarbs,
      totalSodium,
      totalWater,
    };
    onNext(nutritionPlan);
  };

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle>Nutrition Planning</CardTitle>
        <p className="text-muted-foreground">
          Set your target nutrition intake per hour. Total needs are calculated
          based on your estimated completion time of {estimatedTime.toFixed(1)}{" "}
          hours.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                Carbs per Hour
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Recommended range: 30-90 grams per hour</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-3xl font-bold">{carbsPerHour}g</span>
              </div>
              <Slider
                value={[carbsPerHour]}
                min={20}
                max={120}
                step={5}
                onValueChange={(value) => setCarbsPerHour(value[0])}
                className="mb-4"
              />
              <div className="text-sm text-muted-foreground text-center">
                Total: {totalCarbs}g
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                Sodium per Hour
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Recommended range: 300-600 mg per hour</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-3xl font-bold">{sodiumPerHour}mg</span>
              </div>
              <Slider
                value={[sodiumPerHour]}
                min={200}
                max={1000}
                step={50}
                onValueChange={(value) => setSodiumPerHour(value[0])}
                className="mb-4"
              />
              <div className="text-sm text-muted-foreground text-center">
                Total: {(totalSodium / 1000).toFixed(1)}g
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                Water per Hour
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Recommended range: 400-800 ml per hour</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-3xl font-bold">{waterPerHour}ml</span>
              </div>
              <Slider
                value={[waterPerHour]}
                min={200}
                max={1000}
                step={50}
                onValueChange={(value) => setWaterPerHour(value[0])}
                className="mb-4"
              />
              <div className="text-sm text-muted-foreground text-center">
                Total: {(totalWater / 1000).toFixed(1)}L
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleNext}>Next: Aid Stations</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionSliders;

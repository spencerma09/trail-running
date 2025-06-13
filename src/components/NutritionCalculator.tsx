import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, MinusCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { UnitPreferences, unitConversions } from "@/lib/utils";

interface NutritionCalculatorProps {
  raceDistance?: number; // in kilometers or miles based on unitPreferences
  elevationGain?: number; // in meters or feet based on unitPreferences
  estimatedTime?: number; // in hours
  aidStations?: { name: string; distance: number; elevation?: number }[];
  unitPreferences?: UnitPreferences;
}

const NutritionCalculator = ({
  raceDistance = 50,
  elevationGain = 2000,
  estimatedTime = 10,
  aidStations = [
    { name: "Start", distance: 0 },
    { name: "Aid Station 1", distance: 10 },
    { name: "Aid Station 2", distance: 25 },
    { name: "Aid Station 3", distance: 40 },
    { name: "Finish", distance: 50 },
  ],
  unitPreferences = {
    distance: "metric",
    elevation: "metric",
    fluid: "metric",
    weight: "metric",
  },
}: NutritionCalculatorProps) => {
  // Convert to metric for internal calculations if needed
  const distanceInKm =
    unitPreferences.distance === "imperial"
      ? unitConversions.milesToKm(raceDistance)
      : raceDistance;

  const elevationInMeters =
    unitPreferences.elevation === "imperial"
      ? unitConversions.feetToMeters(elevationGain)
      : elevationGain;

  // Convert aid station distances to km for internal calculations
  const normalizedAidStations = aidStations.map((station) => ({
    ...station,
    distanceInKm:
      unitPreferences.distance === "imperial"
        ? unitConversions.milesToKm(station.distance)
        : station.distance,
  }));
  const [caloriesPerHour, setCaloriesPerHour] = useState<number>(250);
  const [fluidPerHour, setFluidPerHour] = useState<number>(500); // in ml
  const [sodiumPerHour, setSodiumPerHour] = useState<number>(500); // in mg
  const [carbsPerHour, setCarbsPerHour] = useState<number>(60); // in grams
  const [activeTab, setActiveTab] = useState<string>("timeline");

  // Calculate total nutrition needs
  const totalCalories = Math.round(caloriesPerHour * estimatedTime);
  const totalFluid = Math.round((fluidPerHour * estimatedTime) / 1000); // convert to liters
  const totalSodium = Math.round((sodiumPerHour * estimatedTime) / 1000); // convert to grams
  const totalCarbs = Math.round(carbsPerHour * estimatedTime); // total carbs in grams

  // Generate hourly nutrition plan
  const hourlyPlan = Array.from(
    { length: Math.ceil(estimatedTime) },
    (_, i) => {
      const hour = i + 1;
      const distanceAtHour = Math.min(
        (distanceInKm / estimatedTime) * hour,
        distanceInKm,
      );

      // Find nearest aid station
      const nearestAidStation = normalizedAidStations
        .filter((station) => station.distanceInKm <= distanceAtHour)
        .sort((a, b) => b.distanceInKm - a.distanceInKm)[0];

      return {
        hour,
        distance: Math.round(distanceAtHour * 10) / 10,
        calories: caloriesPerHour,
        fluid: fluidPerHour,
        sodium: sodiumPerHour,
        carbs: carbsPerHour,
        aidStation: nearestAidStation?.name || null,
      };
    },
  );

  // Sample nutrition products
  const nutritionProducts = [
    {
      name: "Energy Gel",
      calories: 100,
      fluid: 0,
      sodium: 50,
      carbs: 25,
      servingSize: "1 packet",
    },
    {
      name: "Sports Drink",
      calories: 80,
      fluid: 500,
      sodium: 200,
      carbs: 20,
      servingSize: "500ml",
    },
    {
      name: "Energy Bar",
      calories: 200,
      fluid: 0,
      sodium: 100,
      carbs: 40,
      servingSize: "1 bar",
    },
    {
      name: "Salt Tablets",
      calories: 0,
      fluid: 0,
      sodium: 300,
      carbs: 0,
      servingSize: "1 tablet",
    },
    {
      name: "Banana",
      calories: 105,
      fluid: 0,
      sodium: 1,
      carbs: 27,
      servingSize: "1 medium",
    },
  ];

  return (
    <div className="bg-background w-full p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Nutrition Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Calories
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Recommended range: 200-300 calories per hour</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCaloriesPerHour(Math.max(caloriesPerHour - 25, 100))
                }
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold">{caloriesPerHour}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCaloriesPerHour(Math.min(caloriesPerHour + 25, 500))
                }
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <Slider
              value={[caloriesPerHour]}
              min={100}
              max={500}
              step={25}
              onValueChange={(value) => setCaloriesPerHour(value[0])}
              className="my-4"
            />
            <div className="text-sm text-muted-foreground text-center">
              {totalCalories} calories total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Fluid (ml/hour)
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
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setFluidPerHour(Math.max(fluidPerHour - 50, 200))
                }
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold">{fluidPerHour}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setFluidPerHour(Math.min(fluidPerHour + 50, 1000))
                }
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <Slider
              value={[fluidPerHour]}
              min={200}
              max={1000}
              step={50}
              onValueChange={(value) => setFluidPerHour(value[0])}
              className="my-4"
            />
            <div className="text-sm text-muted-foreground text-center">
              {totalFluid} liters total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Sodium (mg/hour)
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
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSodiumPerHour(Math.max(sodiumPerHour - 50, 200))
                }
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold">{sodiumPerHour}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSodiumPerHour(Math.min(sodiumPerHour + 50, 1000))
                }
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <Slider
              value={[sodiumPerHour]}
              min={200}
              max={1000}
              step={50}
              onValueChange={(value) => setSodiumPerHour(value[0])}
              className="my-4"
            />
            <div className="text-sm text-muted-foreground text-center">
              {totalSodium} grams total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Carbs (g/hour)
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
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCarbsPerHour(Math.max(carbsPerHour - 5, 20))}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold">{carbsPerHour}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCarbsPerHour(Math.min(carbsPerHour + 5, 120))}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <Slider
              value={[carbsPerHour]}
              min={20}
              max={120}
              step={5}
              onValueChange={(value) => setCarbsPerHour(value[0])}
              className="my-4"
            />
            <div className="text-sm text-muted-foreground text-center">
              {totalCarbs} grams total
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="timeline">Nutrition Timeline</TabsTrigger>
          <TabsTrigger value="products">Nutrition Products</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <div className="relative w-full h-12 bg-muted rounded-lg overflow-hidden mb-6">
            {aidStations.map((station, index) => {
              const position = (station.distance / raceDistance) * 100;
              return (
                <div
                  key={index}
                  className="absolute top-0 flex flex-col items-center"
                  style={{
                    left: `${position}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="h-12 w-1 bg-primary"></div>
                  <span className="text-xs mt-1">{station.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {station.distance} km
                  </span>
                </div>
              );
            })}
            <Progress value={100} className="w-full h-2" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hour</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Carbs</TableHead>
                <TableHead>Fluid</TableHead>
                <TableHead>Sodium</TableHead>
                <TableHead>Aid Station</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hourlyPlan.map((plan) => (
                <TableRow key={plan.hour}>
                  <TableCell>{plan.hour}</TableCell>
                  <TableCell>{plan.distance} km</TableCell>
                  <TableCell>{plan.calories} cal</TableCell>
                  <TableCell>{plan.carbs} g</TableCell>
                  <TableCell>{plan.fluid} ml</TableCell>
                  <TableCell>{plan.sodium} mg</TableCell>
                  <TableCell>
                    {plan.aidStation ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {plan.aidStation}
                      </span>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Label htmlFor="custom-product">Add Custom Product:</Label>
              <Input
                id="custom-product"
                placeholder="Product name"
                className="max-w-xs"
              />
              <Button variant="outline">Add</Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Carbs</TableHead>
                  <TableHead>Fluid</TableHead>
                  <TableHead>Sodium</TableHead>
                  <TableHead>Serving Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nutritionProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.calories} cal</TableCell>
                    <TableCell>{product.carbs} g</TableCell>
                    <TableCell>{product.fluid} ml</TableCell>
                    <TableCell>{product.sodium} mg</TableCell>
                    <TableCell>{product.servingSize}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <PlusCircle className="h-4 w-4 mr-1" /> Add to Plan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NutritionCalculator;

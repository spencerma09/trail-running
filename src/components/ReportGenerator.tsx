import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, Save } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RaceProfile } from "./RaceProfileForm";
import { NutritionPlan } from "./NutritionSliders";
import { UnitPreferences, formatDistance } from "@/lib/utils";
import SaveRaceDialog from "./SaveRaceDialog";

interface AidStationWithTiming {
  id: string;
  name: string;
  distance: number;
  elevation?: number;
  estimatedTime: number;
  nutritionNeeded: {
    carbs: number;
    sodium: number;
    water: number;
  };
}

interface ReportGeneratorProps {
  raceProfile: RaceProfile;
  nutritionPlan: NutritionPlan;
  aidStations: AidStationWithTiming[];
  onBack: () => void;
  onStartOver: () => void;
  user?: any;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  raceProfile,
  nutritionPlan,
  aidStations,
  onBack,
  onStartOver,
  user,
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const handleExport = (type: "pdf" | "print" | "share") => {
    // Placeholder for export functionality
    console.log(`Exporting report as ${type}`);
  };

  return (
    <div className="w-full space-y-6">
      <Card className="bg-background">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Race Planning Report</CardTitle>
            <div className="flex items-center gap-2">
              {user && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Race
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("pdf")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("print")}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("share")}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Race Overview */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Race Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Race</p>
                <h4 className="text-lg font-bold">{raceProfile.raceName}</h4>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <h4 className="text-lg font-bold">
                  {raceProfile.raceDate} at {raceProfile.startTime}
                </h4>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Distance</p>
                <h4 className="text-lg font-bold">
                  {formatDistance(
                    parseFloat(raceProfile.distance),
                    raceProfile.unitPreferences.distance,
                  )}
                </h4>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Elevation Gain</p>
                <h4 className="text-lg font-bold">
                  {raceProfile.unitPreferences.elevation === "metric"
                    ? `${raceProfile.elevationGain}m`
                    : `${raceProfile.elevationGain}ft`}
                </h4>
              </div>
            </div>
          </div>

          {/* Nutrition Summary */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Nutrition Plan</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Carbs per Hour</p>
                <h4 className="text-2xl font-bold">
                  {nutritionPlan.carbsPerHour}g
                </h4>
                <p className="text-sm text-muted-foreground">
                  Total: {nutritionPlan.totalCarbs}g
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Sodium per Hour</p>
                <h4 className="text-2xl font-bold">
                  {nutritionPlan.sodiumPerHour}mg
                </h4>
                <p className="text-sm text-muted-foreground">
                  Total: {(nutritionPlan.totalSodium / 1000).toFixed(1)}g
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Water per Hour</p>
                <h4 className="text-2xl font-bold">
                  {nutritionPlan.waterPerHour}ml
                </h4>
                <p className="text-sm text-muted-foreground">
                  Total: {(nutritionPlan.totalWater / 1000).toFixed(1)}L
                </p>
              </div>
            </div>
          </div>

          {/* Aid Station Details */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Aid Station Plan</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Estimated Time</TableHead>
                  <TableHead>Carbs Needed</TableHead>
                  <TableHead>Sodium Needed</TableHead>
                  <TableHead>Water Needed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aidStations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell className="font-medium">
                      {station.name}
                    </TableCell>
                    <TableCell>
                      {formatDistance(
                        station.distance,
                        raceProfile.unitPreferences.distance,
                      )}
                    </TableCell>
                    <TableCell>{formatTime(station.estimatedTime)}</TableCell>
                    <TableCell>{station.nutritionNeeded.carbs}g</TableCell>
                    <TableCell>{station.nutritionNeeded.sodium}mg</TableCell>
                    <TableCell>{station.nutritionNeeded.water}ml</TableCell>
                  </TableRow>
                ))}
                {/* Finish Line Entry */}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-medium">🏁 Finish Line</TableCell>
                  <TableCell>
                    {formatDistance(
                      parseFloat(raceProfile.distance),
                      raceProfile.unitPreferences.distance,
                    )}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const [hours, minutes, seconds] =
                        raceProfile.estimatedTime.split(":").map(Number);
                      const totalHours = hours + minutes / 60 + seconds / 3600;
                      return formatTime(totalHours);
                    })()}
                  </TableCell>
                  <TableCell>{nutritionPlan.totalCarbs}g</TableCell>
                  <TableCell>{nutritionPlan.totalSodium}mg</TableCell>
                  <TableCell>{nutritionPlan.totalWater}ml</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onStartOver}>Plan Another Race</Button>
      </div>
    </div>
  );
};

export default ReportGenerator;

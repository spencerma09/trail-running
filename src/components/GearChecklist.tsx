import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GearItem {
  id: string;
  name: string;
  category: string;
  recommended: boolean;
  checked: boolean;
}

import { UnitPreferences, unitConversions } from "@/lib/utils";

interface GearChecklistProps {
  raceDistance?: number; // in kilometers or miles based on unitPreferences
  elevationGain?: number; // in meters or feet based on unitPreferences
  estimatedTime?: number; // in hours
  weatherConditions?: string;
  unitPreferences?: UnitPreferences;
}

const GearChecklist = ({
  raceDistance = 50,
  elevationGain = 2000,
  estimatedTime = 10,
  weatherConditions = "moderate",
  unitPreferences = {
    distance: "metric",
    elevation: "metric",
    fluid: "metric",
    weight: "metric",
  },
}: GearChecklistProps) => {
  // Convert to metric for internal calculations if needed
  const distanceInKm =
    unitPreferences.distance === "imperial"
      ? unitConversions.milesToKm(raceDistance)
      : raceDistance;

  const elevationInMeters =
    unitPreferences.elevation === "imperial"
      ? unitConversions.feetToMeters(elevationGain)
      : elevationGain;
  // Sample initial gear based on race parameters
  const generateInitialGear = () => {
    const baseGear: GearItem[] = [
      {
        id: "1",
        name: "Trail Running Shoes",
        category: "Footwear",
        recommended: true,
        checked: true,
      },
      {
        id: "2",
        name: "Running Socks",
        category: "Footwear",
        recommended: true,
        checked: true,
      },
      {
        id: "3",
        name: "Running Shorts/Tights",
        category: "Clothing",
        recommended: true,
        checked: true,
      },
      {
        id: "4",
        name: "Technical T-shirt",
        category: "Clothing",
        recommended: true,
        checked: true,
      },
      {
        id: "5",
        name: "Hydration Pack/Vest",
        category: "Equipment",
        recommended: true,
        checked: true,
      },
      {
        id: "6",
        name: "Headlamp",
        category: "Equipment",
        recommended: estimatedTime > 8,
        checked: estimatedTime > 8,
      },
      {
        id: "7",
        name: "Backup Batteries",
        category: "Equipment",
        recommended: estimatedTime > 12,
        checked: estimatedTime > 12,
      },
      {
        id: "8",
        name: "First Aid Kit",
        category: "Safety",
        recommended: distanceInKm > 30,
        checked: distanceInKm > 30,
      },
      {
        id: "9",
        name: "Emergency Blanket",
        category: "Safety",
        recommended: distanceInKm > 50,
        checked: distanceInKm > 50,
      },
      {
        id: "10",
        name: "Whistle",
        category: "Safety",
        recommended: distanceInKm > 30,
        checked: distanceInKm > 30,
      },
      {
        id: "11",
        name: "Rain Jacket",
        category: "Weather",
        recommended: weatherConditions !== "sunny",
        checked: weatherConditions !== "sunny",
      },
      {
        id: "12",
        name: "Gloves",
        category: "Weather",
        recommended: weatherConditions === "cold",
        checked: weatherConditions === "cold",
      },
      {
        id: "13",
        name: "Sunscreen",
        category: "Personal Care",
        recommended: true,
        checked: true,
      },
      {
        id: "14",
        name: "Anti-chafing Balm",
        category: "Personal Care",
        recommended: distanceInKm > 20,
        checked: distanceInKm > 20,
      },
      {
        id: "15",
        name: "Sunglasses",
        category: "Accessories",
        recommended: true,
        checked: true,
      },
      {
        id: "16",
        name: "Running Hat/Cap",
        category: "Accessories",
        recommended: true,
        checked: true,
      },
      {
        id: "17",
        name: "Trekking Poles",
        category: "Equipment",
        recommended: elevationInMeters > 1500,
        checked: elevationInMeters > 1500,
      },
      {
        id: "18",
        name: "Compression Sleeves",
        category: "Accessories",
        recommended: false,
        checked: false,
      },
      {
        id: "19",
        name: "GPS Watch",
        category: "Electronics",
        recommended: true,
        checked: true,
      },
      {
        id: "20",
        name: "Phone",
        category: "Electronics",
        recommended: true,
        checked: true,
      },
    ];

    return baseGear;
  };

  const [gearItems, setGearItems] = useState<GearItem[]>(generateInitialGear());
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Equipment");
  const [filter, setFilter] = useState<string>("all");

  const categories = Array.from(
    new Set(gearItems.map((item) => item.category)),
  );

  const handleCheckItem = (id: string) => {
    setGearItems(
      gearItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const handleAddItem = () => {
    if (newItemName.trim()) {
      const newItem: GearItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        category: newItemCategory,
        recommended: false,
        checked: true,
      };
      setGearItems([...gearItems, newItem]);
      setNewItemName("");
    }
  };

  const handleRemoveItem = (id: string) => {
    setGearItems(gearItems.filter((item) => item.id !== id));
  };

  const filteredItems =
    filter === "all"
      ? gearItems
      : filter === "checked"
        ? gearItems.filter((item) => item.checked)
        : filter === "unchecked"
          ? gearItems.filter((item) => !item.checked)
          : gearItems.filter((item) => item.category === filter);

  const groupedItems = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, GearItem[]>,
  );

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Gear Checklist</span>
          <div className="flex gap-2">
            <Badge
              variant={filter === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("all")}
            >
              All
            </Badge>
            <Badge
              variant={filter === "checked" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("checked")}
            >
              Packed
            </Badge>
            <Badge
              variant={filter === "unchecked" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("unchecked")}
            >
              Unpacked
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={filter === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilter(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex gap-2">
            <Input
              placeholder="Add new gear item"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-grow"
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
            <Button onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-6">
                <h3 className="font-medium text-lg mb-2">{category}</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.checked}
                          onCheckedChange={() => handleCheckItem(item.id)}
                        />
                        <label
                          htmlFor={`item-${item.id}`}
                          className={`text-sm ${item.checked ? "" : "text-muted-foreground"}`}
                        >
                          {item.name}
                          {item.recommended && (
                            <span className="ml-2 text-xs text-primary">
                              (Recommended)
                            </span>
                          )}
                        </label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {gearItems.filter((item) => item.checked).length} of{" "}
              {gearItems.length} items packed
            </div>
            <Button
              variant="outline"
              onClick={() => setGearItems(generateInitialGear())}
            >
              Reset to Recommendations
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GearChecklist;

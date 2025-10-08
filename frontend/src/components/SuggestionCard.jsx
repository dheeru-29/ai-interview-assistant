import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SuggestionCard = ({ title, suggestions }) => {
  if (!suggestions || suggestions.length === 0) {
    return (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent><p className=" text-amber-400 text-sm text-muted-foreground">No suggestions available.</p></CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-amber-50 list-disc list-outside space-y-2 pl-4 text-muted-foreground">
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default SuggestionCard;
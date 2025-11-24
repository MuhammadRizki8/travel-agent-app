'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Field = { key: string; label: string; type: string };

interface DebugPreferencesProps {
  show: boolean;
  onToggle: () => void;
  onClear: () => void | Promise<void>;
  schemaFields: Field[];
  displayParams: Record<string, unknown> | null;
}

export default function DebugPreferences({ show, onToggle, onClear, schemaFields, displayParams }: DebugPreferencesProps) {
  return (
    <div className="mb-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Preferences</CardTitle>
            <div className="text-sm text-muted-foreground">Detected and persisted search preferences (debug)</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={show ? 'ghost' : 'secondary'} size="sm" onClick={onToggle}>
              {show ? 'Hide' : 'Show'}
            </Button>
            <Button variant="destructive" size="sm" onClick={onClear}>
              Clear
            </Button>
          </div>
        </CardHeader>
        {show && (
          <>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Field</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {schemaFields.map((f) => {
                    const val = (displayParams as Record<string, unknown>)?.[f.key];
                    const isFilled = typeof val !== 'undefined' && val !== null && String(val).trim() !== '';
                    return (
                      <TableRow key={f.key} className="align-top">
                        <TableCell className="py-2 pr-2 font-medium">{f.label}</TableCell>
                        <TableCell className="py-2 pr-2 text-muted-foreground">{f.type}</TableCell>
                        <TableCell className="py-2 pr-2 wrap-break-word max-w-md">{isFilled ? String(val) : <span className="text-gray-400">—</span>}</TableCell>
                        <TableCell className="py-2">{isFilled ? <Badge variant="default">Filled</Badge> : <span className="text-gray-500">Empty</span>}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="w-full text-xs">
                <div className="font-medium mb-1">Raw detected object</div>
                <pre className="whitespace-pre-wrap text-xs bg-muted/10 p-3 rounded w-full">{JSON.stringify(displayParams ?? {}, null, 2)}</pre>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

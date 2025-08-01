import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ShadcnDemo() {
  const [inputValue, setInputValue] = useState('');

  const sampleData = [
    { id: 1, trackingNumber: 'TRK001', status: 'In Transit', location: 'Warehouse A' },
    { id: 2, trackingNumber: 'TRK002', status: 'Delivered', location: 'Customer Address' },
    { id: 3, trackingNumber: 'TRK003', status: 'Out for Delivery', location: 'Local Hub' },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      'In Transit': 'default',
      'Delivered': 'secondary',
      'Out for Delivery': 'destructive'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>shadcn/ui Components Demo</CardTitle>
          <CardDescription>
            This demonstrates the installed shadcn/ui components for your QR code tracker application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buttons Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Buttons</h3>
            <div className="flex gap-2 flex-wrap">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Form Elements</h3>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                type="text"
                placeholder="Enter tracking number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>

          {/* Badges Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status Badges</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          {/* Table Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tracking Data Table</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.trackingNumber}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>{item.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Dialog Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dialog Example</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tracking Information</DialogTitle>
                  <DialogDescription>
                    This is an example dialog that could show detailed tracking information.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>Your package is currently in transit and expected to arrive within 2-3 business days.</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Dropdown Menu Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dropdown Menu</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Package Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Update Status</DropdownMenuItem>
                <DropdownMenuItem>Send Notification</DropdownMenuItem>
                <DropdownMenuItem>Print Label</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AppointmentsAdmin = () => {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Appointments Management</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Appointments management functionality coming soon.</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default AppointmentsAdmin;

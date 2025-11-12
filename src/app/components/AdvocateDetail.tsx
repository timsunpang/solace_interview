"use client";

import { Card, CardBody, CardHeader, Typography, Chip, Avatar } from "@material-tailwind/react";
import type { Advocate } from "@/app/context/SearchContext";

export default function AdvocateDetail({ advocate }: { advocate: Advocate }) {
  const {
    firstName,
    lastName,
    city,
    degree,
    yearsOfExperience,
    phoneNumber,
    specialties,
  } = advocate;

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader floated={false} shadow={false} className="rounded-none p-6">
        <div className="flex items-center gap-6">
          <Avatar
            src="https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-4.jpg"
            alt={`${firstName}_${lastName}`}
            className="w-32 h-32"
            variant="circular"
          />
          <div className="flex flex-col gap-1">
            <Typography variant="h4" color="blue-gray">
              {firstName} {lastName}
            </Typography>
            <Typography variant="small" color="blue-gray" className="opacity-70">
              {degree} • {city}
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-6 pb-6 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <Typography variant="small" className="text-gray-600">Years of Experience</Typography>
            <Typography>{yearsOfExperience}</Typography>
          </div>
          <div>
            <Typography variant="small" className="text-gray-600">Phone Number</Typography>
            <Typography>{phoneNumber}</Typography>
          </div>
        </div>

        <div>
          <Typography variant="small" className="text-gray-600 mb-2">Specialties</Typography>
          <div className="flex flex-wrap gap-2">
            {(specialties || []).map((s, idx) => (
              <Chip key={idx} value={s} variant="ghost" className="rounded-full" />
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}


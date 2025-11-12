"use client";

import { memo, useEffect, useState } from "react";
import { useSearch } from "@/app/context/SearchContext";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import AdvocateDetail from "./AdvocateDetail";
import type { Advocate } from "@/app/context/SearchContext";
 
const TABLE_HEAD = ["Name", "City", "Degree", "Years of Experience", "Phone Number"];
 
function SearchTableInner() {
  const { advocates, loading, page, totalPages, total, nextPage, prevPage } = useSearch();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Advocate | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!open || !selected?.id) return;
      try {
        setLoadingDetail(true);
        const res = await fetch(`/api/advocates/${selected.id}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data) setSelected(json.data);
        }
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [open, selected?.id]);

  const onRowClick = (a: Advocate) => {
    setSelected(a);
    setOpen(true);
  };
  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              Members list
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              See information about all members
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-scroll px-0">
        <table className="mt-4 w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {advocates.map(
              ({ firstName, lastName, city, degree, yearsOfExperience, phoneNumber }, index) => {
                const a = advocates[index];
                const isLast = index === advocates.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";

                return (
                  <tr key={index} className="cursor-pointer hover:bg-blue-gray-50/40" onClick={() => onRowClick(a)}>
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        <Avatar src="https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-4.jpg" alt={firstName + "_" + lastName} size="sm" />
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {firstName} {lastName}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className={classes}>
                      <div className="flex flex-col">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {city}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {degree}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {yearsOfExperience}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {phoneNumber}
                      </Typography>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
        {loading && (
          <div className="p-4 text-sm text-gray-600">Loading…</div>
        )}
      </CardBody>
      <Dialog open={open} handler={setOpen} size="lg">
        <DialogBody className="px-6">
          {selected ? (
            <AdvocateDetail advocate={selected} />
          ) : (
            <div className="p-6 text-gray-600">No advocate selected.</div>
          )}
          {loadingDetail && (
            <div className="mt-4 text-sm text-gray-500">Refreshing details…</div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="filled" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Page {page} of {Math.max(1, totalPages)} • {total} results
        </Typography>
        <div className="flex gap-2">
          <Button variant="outlined" size="sm" onClick={prevPage} disabled={loading || page <= 1}>
            Previous
          </Button>
          <Button variant="outlined" size="sm" onClick={nextPage} disabled={loading || page >= totalPages}>
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default memo(SearchTableInner);

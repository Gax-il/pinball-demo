"use client";

import React, { useEffect, useState } from "react";
import { socket } from "@/app/socket";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { IconCoin, IconLoader2, IconUser } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const Page = () => {
  const [clients, setClients] = useState<
    { id: number; credit: number; gamesLeft: number; blocked: boolean }[]
  >([]);

  useEffect(() => {
    socket.emit("clientsLoad");
  }, []);

  useEffect(() => {
    const handleClientSetAdmin = (data: {
      id: number;
      credit: number;
      gamesLeft: number;
      blocked: boolean;
    }) => {
      setClients((prevState) => [...prevState, data]);
    };

    socket.on("clientSetAdmin", handleClientSetAdmin);

    return () => {
      socket.off("clientSetAdmin", handleClientSetAdmin);
    };
  }, []);

  useEffect(() => {
    const handleCreditUpdate = (data: {
      id: number;
      credit: number;
      gamesLeft: number;
      blocked: boolean;
    }) => {
      setClients((prevState) =>
        prevState.map((client) =>
          client.id === data.id
            ? {
                ...client,
                credit: data.credit,
                gamesLeft: data.gamesLeft,
                blocked: data.blocked,
              }
            : client
        )
      );
    };

    const handleAdminCreditUpdate = (data: {
      id: number;
      credit: number;
      gamesLeft: number;
      blocked: boolean;
    }) => {
      setClients((prevState) =>
        prevState.map((client) =>
          client.id === data.id
            ? {
                ...client,
                credit: data.credit,
                gamesLeft: data.gamesLeft,
                blocked: data.blocked,
              }
            : client
        )
      );
    };

    const handleClientReset = () => {
      setClients([]);
    };

    const handleBlockUpdate = (data: { id: number; blocked: boolean }) => {
      setClients((prevState) =>
        prevState.map((client) =>
          client.id === data.id ? { ...client, blocked: data.blocked } : client
        )
      );
    };

    const handleClientsData = (
      data: {
        id: number;
        credit: number;
        gamesLeft: number;
        blocked: boolean;
      }[]
    ) => {
      setClients(data);
    };

    socket.on("creditUpdate", handleCreditUpdate);
    socket.on("adminCreditUpdate", handleAdminCreditUpdate);
    socket.on("clientReset", handleClientReset);
    socket.on("blockUpdate", handleBlockUpdate);
    socket.on("clientsData", handleClientsData);

    return () => {
      socket.off("creditUpdate", handleCreditUpdate);
      socket.off("adminCreditUpdate", handleAdminCreditUpdate);
      socket.off("clientReset", handleClientReset);
      socket.off("blockUpdate", handleBlockUpdate);
      socket.off("clientsData", handleClientsData);
    };
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-3 flex justify-between items-center flex-col">
        {clients.length > 0 ? (
          <>
            <div className="flex justify-between w-full items-center mb-2">
              <p className="text-4xl md:text-5xl lg:text-6xl">Klienti:</p>
              <Button
                variant="destructive"
                className="text-xl"
                onClick={() => socket.emit("adminReset")}
              >
                Reset
              </Button>
            </div>
            <div className="w-full gap-2 grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 ">
              {clients.map((client) => (
                <Card
                  key={client.id}
                  className={cn(
                    "ease-in-out duration-200",
                    client.blocked ? "border-red-600 border-4" : "p-[3px]"
                  )}
                >
                  <CardHeader>
                    <span className="flex text-3xl md:text-4xl lg:text-5xl items-end">
                      #{client.id}
                    </span>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-lg md:text-xl lg:text-2xl">
                    <span>Kredit: {client.credit}</span>
                    <span>Hry: {client.gamesLeft}</span>
                  </CardContent>
                  <CardFooter className="gap-2 flex flex-col md:flex-row">
                    <Button
                      className="flex-1 w-full md:w-auto"
                      onClick={() =>
                        socket.emit("adminCreditIncrease", {
                          id: client.id,
                          amount: 10,
                        })
                      }
                    >
                      Dát 10 kreditů
                    </Button>
                    <Button
                      className="flex-1 w-full md:w-auto"
                      onClick={() =>
                        socket.emit("adminBlock", {
                          id: client.id,
                        })
                      }
                    >
                      {client.blocked ? "Odblokovat" : "Blokovat"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-4xl">Čekám na připojení klientů</p>
            <IconLoader2 className="animate-spin" width={150} height={150} />
          </>
        )}
      </div>
    </div>
  );
};

export default Page;

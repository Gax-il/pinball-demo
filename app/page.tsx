"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/app/socket";
import { Button } from "@/components/ui/button";
import {
  IconBarrierBlock,
  IconCoins,
  IconGoGame,
  IconUser,
} from "@tabler/icons-react";

export default function Home() {
  const [credit, setCredit] = useState<number>(0);
  const [clientId, setClientId] = useState<number | null>(null);
  const [gamesLeft, setGamesLeft] = useState<number>(0);
  const [blocked, setBlocked] = useState<boolean>(false);
  const [state, setState] = useState<"none" | "coins-added" | "game-bought">(
    "none"
  );
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socket.on("clientSet", (data) => {
      if (clientId === null) {
        console.log("Client set event received in app/page.tsx:", data);
        setClientId(data.id);
        setCredit(data.credit);
        console.log(data);
      }
    });

    socket.on("clientReset", () => {
      setClientId(null);
      setCredit(0);
      setGamesLeft(0);
    });

    return () => {
      socket.off("clientSet");
      socket.off("clientReset");
    };
  }, []);

  useEffect(() => {
    socket.on("creditUpdate", (data) => {
      console.log("Credit update event received in app/page.tsx:", data);
      setCredit(data.credit);
      setGamesLeft(data.gamesLeft);
    });

    socket.on("blockUpdate", (data) => {
      console.log("Block update event received in app/page.tsx:", data);
      if (data.id === clientId) {
        setBlocked(data.blocked);
      }
    });

    socket.on("fromAdminCreditUpdate", (data) => {
      if (data.id === clientId) {
        if (timer.current) {
          clearTimeout(timer.current);
        }
        setCredit(data.credit);
        setState("coins-added");

        timer.current = setTimeout(() => {
          setState("none");
        }, 2000);
      }
    });

    return () => {
      socket.off("creditUpdate");
      socket.off("blockUpdate");
      socket.off("fromAdminCreditUpdate");
    };
  }, [clientId]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    socket.emit("clientAdd");
  };

  return (
    <div className="relative w-screen h-screen">
      {blocked && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center flex-col bg-black bg-opacity-10">
          <IconBarrierBlock
            className="text-red-500 "
            width={150}
            height={150}
          />
          <p>Jsi zablokován</p>
        </div>
      )}
      {!blocked && state !== "none" && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center flex-col bg-black bg-opacity-10">
          {state === "coins-added" && (
            <>
              <IconCoins className="text-green-500 " width={150} height={150} />
              <p>Dostali jsi 10 kreditů</p>
            </>
          )}
          {state === "game-bought" && (
            <>
              <IconGoGame
                className="text-green-500 "
                width={150}
                height={150}
              />
              <p>Zahrál jsi si hru</p>
            </>
          )}
        </div>
      )}
      {clientId ? (
        <div className="flex flex-col justify-between w-screen h-screen p-4">
          <div className="flex justify-between">
            <span className="flex text-6xl items-center ">
              <IconUser className="text-green-500" width={60} height={60} />
              {clientId}
            </span>
            <div className="flex items-end flex-col">
              <span className="flex text-6xl items-center">
                {credit}
                <IconCoins className="text-green-500" width={60} height={60} />
              </span>
              <span className="flex text-6xl items-center">
                {gamesLeft}
                <IconGoGame className="text-green-500" width={60} height={60} />
              </span>
            </div>
          </div>
          <div className="flex gap-2 mx-4">
            <Button
              className="flex-1 h-20 text-4xl"
              disabled={credit < 10 || blocked}
              onClick={() =>
                socket.emit("creditDecrease", {
                  id: clientId,
                  amount: 10,
                  gameBought: 1,
                })
              }
            >
              1 hra
            </Button>
            <Button
              className="flex-1 h-20 text-4xl"
              disabled={credit < 25 || blocked}
              onClick={() =>
                socket.emit("creditDecrease", {
                  id: clientId,
                  amount: 25,
                  gameBought: 5,
                })
              }
            >
              5 her
            </Button>
            <Button
              className="flex-1 h-20 text-4xl"
              disabled={gamesLeft <= 0 || blocked}
              onClick={() => {
                socket.emit("gameBuy", { id: clientId, gameBought: 1 });
                setState("game-bought");

                timer.current = setTimeout(() => {
                  setState("none");
                }, 2000);
              }}
            >
              Zahrat si
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={handleSubmit}>Set active client</Button>
      )}
    </div>
  );
}

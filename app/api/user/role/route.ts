import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function PATCH(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { role } = await req.json();

  if (!["EMPLOYER", "SITTER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: (decoded as any).sub },
    data: { role },
  });

  const newToken = jwt.sign(
    {
      sub: updatedUser.id,
      phone: updatedUser.phone,
      role: updatedUser.role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" },
  );

  return NextResponse.json({
    user: updatedUser,
    token: newToken,
  });
}

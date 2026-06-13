import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";

// GET — fetch current social connections status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email }).lean();

    const accounts = {
      tiktok: !!user?.socialAccounts?.tiktok?.accessToken,
      instagram: !!user?.socialAccounts?.instagram?.accessToken,
      facebook: !!user?.socialAccounts?.facebook?.accessToken,
    };

    return NextResponse.json({ accounts });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — save access token for a platform (manual token entry)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platform, accessToken, accountId } = await req.json();
    if (!platform || !accessToken) {
      return NextResponse.json({ error: "Platform and accessToken are required" }, { status: 400 });
    }

    await dbConnect();
    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          [`socialAccounts.${platform}.accessToken`]: accessToken,
          [`socialAccounts.${platform}.accountId`]: accountId || "",
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: `${platform} connected successfully.` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — disconnect a platform
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platform } = await req.json();
    if (!platform) {
      return NextResponse.json({ error: "Platform is required" }, { status: 400 });
    }

    await dbConnect();
    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $unset: {
          [`socialAccounts.${platform}`]: "",
        },
      }
    );

    return NextResponse.json({ success: true, message: `${platform} disconnected.` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

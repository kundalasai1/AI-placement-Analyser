import { NextRequest, NextResponse } from "next/server";

type StudentRequest = {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  graduationYear?: string;
  skills?: string;
  projects?: string;
  preferredRole?: string;
};

const MAX_FIELD_LENGTH = 4_000;

function clean(value: unknown): string {
  return typeof value === "string"
    ? value.trim().slice(0, MAX_FIELD_LENGTH)
    : "";
}

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as StudentRequest;

    console.log("RAW WEBSITE INPUT:", input);

    const body = {
      name: clean(input.name),
      email: clean(input.email),
      phone: clean(input.phone),
      department: clean(input.department),
      graduationYear: clean(input.graduationYear),
      skills: clean(input.skills),
      projects: clean(input.projects),
      preferredRole: clean(input.preferredRole),
    };

    console.log("CLEANED BODY SENT TO N8N:", body);

    if (!body.name || !body.email || !body.skills || !body.department) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, department and skills are required.",
        },
        { status: 400 },
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid email address.",
        },
        { status: 400 },
      );
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const appSecret = process.env.N8N_APP_SECRET;

    console.log("N8N WEBHOOK URL:", webhookUrl);

    if (!webhookUrl || !appSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration is missing.",
        },
        { status: 500 },
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 75_000);

    try {
      const n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-secret": appSecret,
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: controller.signal,
      });

      const raw = await n8nResponse.text();

      console.log("N8N STATUS:", n8nResponse.status);
      console.log("N8N RAW RESPONSE:", raw);

      let data: unknown;

      try {
        data = JSON.parse(raw);
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "Automation returned an invalid response.",
            details: raw || "Empty response from n8n.",
          },
          { status: 502 },
        );
      }

      return NextResponse.json(data, {
        status: n8nResponse.status,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Analysis took too long. Please try again."
        : "Unable to analyse the profile.";

    console.error("Placement analysis error:", error);

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}
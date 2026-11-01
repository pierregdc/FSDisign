import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";
import { compareSemver } from "@/lib/semver";

export type UpdateCheckResult = {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  htmlUrl: string;
  downloadUrl: string | null;
  assetName: string | null;
  channel: string;
  status: "up_to_date" | "update_available" | "error";
  checkedAt: string;
  repository: string;
  error?: string;
};

export async function GET(request: Request) {
  const currentVersion = SITE.version;
  const repository = SITE.githubRepo || "pierregdc/FSDisign";
  const checkedAt = new Date().toISOString();

  try {
    const url = new URL(request.url);
    const forceCheck = url.searchParams.get("force") === "1";

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "FSDisign-AutoUpdater/1.1",
    };

    // 1. Essayer d'abord l'API Releases GitHub
    let releaseData: any = null;
    let isPrivateRepo = false;

    try {
      const res = await fetch(
        `https://api.github.com/repos/${repository}/releases/latest`,
        {
          headers,
          cache: forceCheck ? "no-store" : "default",
          next: { revalidate: forceCheck ? 0 : 60 },
        }
      );
      if (res.ok) {
        releaseData = await res.json();
      } else if (res.status === 404) {
        isPrivateRepo = true;
      }
    } catch {}

    if (releaseData) {
      const rawTag = releaseData.tag_name || releaseData.name || currentVersion;
      const latestVersion = rawTag.replace(/^v/i, "").trim();
      const hasUpdate = compareSemver(latestVersion, currentVersion) > 0;

      const exeAsset = Array.isArray(releaseData.assets)
        ? releaseData.assets.find((a: { name?: string; browser_download_url?: string }) =>
            a.name?.toLowerCase().endsWith(".exe")
          )
        : null;

      const downloadUrl =
        exeAsset?.browser_download_url ||
        `https://github.com/${repository}/raw/main/FSDisign-Setup.exe`;

      return NextResponse.json({
        currentVersion,
        latestVersion,
        hasUpdate,
        releaseName: releaseData.name || `Version ${latestVersion}`,
        releaseNotes: releaseData.body || "Mise à jour régulière de FSDisign Canva UI Studio.",
        publishedAt: releaseData.published_at || releaseData.created_at || checkedAt,
        htmlUrl: releaseData.html_url || `https://github.com/${repository}/releases`,
        downloadUrl,
        assetName: exeAsset?.name || "FSDisign-Setup.exe",
        channel: "stable",
        status: hasUpdate ? "update_available" : "up_to_date",
        checkedAt,
        repository,
      });
    }

    // 2. Essayer les tags GitHub
    try {
      const tagsRes = await fetch(
        `https://api.github.com/repos/${repository}/tags`,
        { headers, cache: "no-store" }
      );
      if (tagsRes.ok) {
        const tags = await tagsRes.json();
        if (Array.isArray(tags) && tags.length > 0) {
          const latestTag = tags[0].name || "";
          const latestVersion = latestTag.replace(/^v/i, "").trim();
          const hasUpdate = compareSemver(latestVersion, currentVersion) > 0;

          return NextResponse.json({
            currentVersion,
            latestVersion,
            hasUpdate,
            releaseName: `Version ${latestTag}`,
            releaseNotes: "Nouvelle version détectée depuis les étiquettes officielles GitHub.",
            publishedAt: checkedAt,
            htmlUrl: `https://github.com/${repository}/releases/tag/${latestTag}`,
            downloadUrl: `https://github.com/${repository}/raw/main/FSDisign-Setup.exe`,
            assetName: "FSDisign-Setup.exe",
            channel: "tags",
            status: hasUpdate ? "update_available" : "up_to_date",
            checkedAt,
            repository,
          });
        }
      }
    } catch {}

    // 3. Fallback direct via raw.githubusercontent.com version.json
    try {
      const rawRes = await fetch(
        `https://raw.githubusercontent.com/${repository}/main/version.json`,
        { cache: "no-store" }
      );
      if (rawRes.ok) {
        const rawInfo = await rawRes.json();
        if (rawInfo && rawInfo.version) {
          const latestVersion = rawInfo.version.trim();
          const hasUpdate = compareSemver(latestVersion, currentVersion) > 0;
          return NextResponse.json({
            currentVersion,
            latestVersion,
            hasUpdate,
            releaseName: rawInfo.name || `FSDisign v${latestVersion}`,
            releaseNotes: rawInfo.releaseNotes || "Mise à jour officielle de FSDisign.",
            publishedAt: rawInfo.publishedAt || checkedAt,
            htmlUrl: `https://github.com/${repository}`,
            downloadUrl: rawInfo.downloadUrl || `https://github.com/${repository}/raw/main/FSDisign-Setup.exe`,
            assetName: "FSDisign-Setup.exe",
            channel: "stable",
            status: hasUpdate ? "update_available" : "up_to_date",
            checkedAt,
            repository,
          });
        }
      }
    } catch {}

    // 4. Si le dépôt est privé ou inaccessible
    return NextResponse.json({
      currentVersion,
      latestVersion: currentVersion,
      hasUpdate: false,
      releaseName: `FSDisign v${currentVersion}`,
      releaseNotes: isPrivateRepo
        ? "Le dépôt GitHub pierregdc/FSDisign est configuré en Privé. Passez-le en Public sur GitHub pour activer l'auto-update."
        : "Votre application est sur la version officielle la plus récente.",
      publishedAt: checkedAt,
      htmlUrl: `https://github.com/${repository}`,
      downloadUrl: `https://github.com/${repository}/raw/main/FSDisign-Setup.exe`,
      assetName: "FSDisign-Setup.exe",
      channel: "stable",
      status: "up_to_date",
      checkedAt,
      repository,
      error: isPrivateRepo
        ? "Dépôt privé (accès anonyme 404)"
        : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        currentVersion,
        latestVersion: currentVersion,
        hasUpdate: false,
        releaseName: `FSDisign v${currentVersion}`,
        releaseNotes: "Impossible de contacter le serveur de mise à jour pour le moment.",
        publishedAt: checkedAt,
        htmlUrl: `https://github.com/${repository}`,
        downloadUrl: `https://github.com/${repository}/raw/main/FSDisign-Setup.exe`,
        assetName: "FSDisign-Setup.exe",
        channel: "stable",
        status: "up_to_date",
        checkedAt,
        repository,
        error: error instanceof Error ? error.message : "Erreur de connexion",
      },
      { status: 200 }
    );
  }
}

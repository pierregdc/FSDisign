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
      "User-Agent": "FSDisign-AutoUpdater/1.0",
    };

    // Vérifier les releases GitHub
    const res = await fetch(
      `https://api.github.com/repos/${repository}/releases/latest`,
      {
        headers,
        cache: forceCheck ? "no-store" : "default",
        next: { revalidate: forceCheck ? 0 : 60 },
      }
    );

    if (res.ok) {
      const release = await res.json();
      const rawTag = release.tag_name || release.name || currentVersion;
      const latestVersion = rawTag.replace(/^v/i, "").trim();
      const hasUpdate = compareSemver(latestVersion, currentVersion) > 0;

      // Chercher un asset .exe d'installation
      const exeAsset = Array.isArray(release.assets)
        ? release.assets.find((a: { name?: string; browser_download_url?: string }) =>
            a.name?.toLowerCase().endsWith(".exe")
          )
        : null;

      const downloadUrl =
        exeAsset?.browser_download_url ||
        release.zipball_url ||
        release.html_url ||
        `https://github.com/${repository}/releases/tag/${rawTag}`;

      const payload: UpdateCheckResult = {
        currentVersion,
        latestVersion,
        hasUpdate,
        releaseName: release.name || `Version ${latestVersion}`,
        releaseNotes: release.body || "Mise à jour régulière de FSDisign Canva UI Studio.",
        publishedAt: release.published_at || release.created_at || checkedAt,
        htmlUrl: release.html_url || `https://github.com/${repository}/releases`,
        downloadUrl,
        assetName: exeAsset?.name || "FSDisign-Setup.exe",
        channel: "stable",
        status: hasUpdate ? "update_available" : "up_to_date",
        checkedAt,
        repository,
      };

      return NextResponse.json(payload);
    }

    // Si aucune release officielle n'existe encore (HTTP 404), vérifier les tags
    if (res.status === 404) {
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
            releaseNotes: "Nouvelle version détectée depuis les étiquettes GitHub.",
            publishedAt: checkedAt,
            htmlUrl: `https://github.com/${repository}/releases/tag/${latestTag}`,
            downloadUrl: `https://github.com/${repository}/archive/refs/tags/${latestTag}.zip`,
            assetName: `${latestTag}.zip`,
            channel: "tags",
            status: hasUpdate ? "update_available" : "up_to_date",
            checkedAt,
            repository,
          });
        }
      }
    }

    // Réponse par défaut lorsque la version courante est la plus récente
    return NextResponse.json({
      currentVersion,
      latestVersion: currentVersion,
      hasUpdate: false,
      releaseName: `FSDisign v${currentVersion}`,
      releaseNotes: "Votre application est sur la version officielle la plus récente.",
      publishedAt: checkedAt,
      htmlUrl: `https://github.com/${repository}`,
      downloadUrl: null,
      assetName: null,
      channel: "stable",
      status: "up_to_date",
      checkedAt,
      repository,
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
        downloadUrl: null,
        assetName: null,
        channel: "stable",
        status: "up_to_date",
        checkedAt,
        repository,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 200 }
    );
  }
}

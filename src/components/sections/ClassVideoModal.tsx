"use client";

import { Clapperboard } from "lucide-react";
import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getWhatsAppLink } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

interface ClassVideoModalProps {
  open: boolean;
  onClose: () => void;
}

const { video } = siteConfig.classes;

/**
 * Class preview video dialog.
 *
 * The play button in the Classes section was previously pure decoration — it
 * had hover and tap animations and pulse rings but no handler, so it looked
 * interactive and did nothing. It now opens this dialog.
 *
 * Until a real clip exists (`classes.video.url` is null), the dialog is honest
 * about that and offers the two routes a curious visitor actually wants,
 * rather than pretending a video is loading.
 */
export function ClassVideoModal({ open, onClose }: ClassVideoModalProps) {
  const whatsappLink = getWhatsAppLink(
    siteConfig.social.whatsapp.number,
    "Hi! I'd like to know how the live online classes work.",
  );

  const hasVideo = Boolean(video.url);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={hasVideo ? video.title : video.pendingTitle}
      className="sm:max-w-3xl"
    >
      {hasVideo ? (
        <div>
          <h2 className="pr-10 font-display text-2xl tracking-wide text-white md:text-3xl">
            {video.title}
          </h2>
          <div className="mt-5 aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
            {/*
              `url` must be an *embed* URL (youtube.com/embed/ID or
              player.vimeo.com/video/ID), not a watch link — watch links refuse
              to render in an iframe. An .mp4 works too via the <video> branch.
            */}
            {video.url!.endsWith(".mp4") ? (
              <video
                className="h-full w-full"
                controls
                autoPlay
                playsInline
                preload="metadata"
              >
                <source src={video.url!} type="video/mp4" />
                Your browser does not support embedded video.
              </video>
            ) : (
              <iframe
                src={video.url!}
                title={video.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      ) : (
        <div className="py-4 text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan">
            <Clapperboard className="h-8 w-8" aria-hidden="true" />
          </div>
          <h2 className="mt-5 font-display text-2xl tracking-wide text-white md:text-3xl">
            {video.pendingTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
            {video.pendingMessage}
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-bg-elevated/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-lime">
              Live class schedule
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              {siteConfig.classes.schedule}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              href={whatsappLink}
              external
              className="block flex-1 text-center"
              onClick={() =>
                trackEvent("whatsapp_click", { source: "class_video_modal" })
              }
            >
              Ask About Classes
            </Button>
            <Button
              href={siteConfig.calendly.booking}
              external
              variant="secondary"
              className="block flex-1 text-center"
              onClick={() =>
                trackEvent("booking_calendly_click", {
                  source: "class_video_modal",
                })
              }
            >
              Book a Call
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

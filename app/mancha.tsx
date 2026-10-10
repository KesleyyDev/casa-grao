"use client";

import { useEffect, useRef } from "react";

/*
 * O café caindo no pano: um vídeo (gerado no Flow) do café sendo absorvido
 * pela trama, do pano limpo até o plate aprovado. O último quadro do vídeo é
 * o próprio plate, então a troca vídeo → imagem não aparece.
 * Sem JS, com movimento reduzido, ou se o vídeo não tocar, a página abre
 * com a mancha pronta.
 */

const VIDEOS = {
  celular: { src: "/plates/mancha-celular.mp4", poster: "/plates/pano-limpo-celular.jpg" },
  computador: { src: "/plates/mancha-computador.mp4", poster: "/plates/pano-limpo-computador.jpg" },
};

// o vídeo tem 8s; acelerado pra caber no tempo de uma primeira tela
const VELOCIDADE = 1.6;
// fração do vídeo em que o café já cobriu o miolo e as letras começam a surgir
const LETRAS_EM = 0.42;
// se o vídeo não começar nesse tempo, a mancha aparece pronta
const ESPERA_MAX = 2500;

export function Mancha() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const raiz = document.documentElement;
    if (raiz.dataset.mancha !== "seco") return;

    const video = videoRef.current;
    const molha = () => {
      raiz.dataset.mancha = "molhado";
      video?.pause();
    };
    if (!video) return molha();

    const largo = matchMedia("(min-width: 820px)").matches;
    const escolha = largo ? VIDEOS.computador : VIDEOS.celular;

    let comecou = false;
    let letras = false;

    const desiste = window.setTimeout(() => {
      if (!comecou) molha();
    }, ESPERA_MAX);

    // depois que desistiu, o vídeo atrasado não volta a esconder a mancha pronta
    const aoTocar = () => {
      if (raiz.dataset.mancha !== "seco") return;
      comecou = true;
      raiz.dataset.mancha = "caindo";
    };

    const aoAvancar = () => {
      if (!letras && raiz.dataset.mancha === "caindo" && video.duration && video.currentTime / video.duration >= LETRAS_EM) {
        letras = true;
        raiz.dataset.mancha = "molhando";
      }
    };

    video.addEventListener("playing", aoTocar);
    video.addEventListener("timeupdate", aoAvancar);
    video.addEventListener("ended", molha);
    video.addEventListener("error", molha);

    video.poster = escolha.poster;
    video.src = escolha.src;
    video.defaultPlaybackRate = VELOCIDADE;
    video.playbackRate = VELOCIDADE;
    video.play().catch(molha);

    return () => {
      window.clearTimeout(desiste);
      video.removeEventListener("playing", aoTocar);
      video.removeEventListener("timeupdate", aoAvancar);
      video.removeEventListener("ended", molha);
      video.removeEventListener("error", molha);
      video.pause();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="mancha-video"
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}

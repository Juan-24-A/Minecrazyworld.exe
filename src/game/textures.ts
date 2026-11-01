import * as THREE from 'three';
import { BlockType } from '../types';

export class TextureGenerator {
  private cache: Map<string, THREE.CanvasTexture> = new Map();

  private createPixelCanvas(width = 16, height = 16): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = false;
    return [canvas, ctx];
  }

  private wrapTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Noise generator for textures
  private noise(x: number, y: number, seed: number = 0): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  }

  public getTexture(key: string, drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): THREE.CanvasTexture {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    const [canvas, ctx] = this.createPixelCanvas(16, 16);
    drawFn(ctx, 16, 16);
    const texture = this.wrapTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  // Generate All Block Materials for Three.js
  public getBlockMaterials(type: BlockType): THREE.Material[] {
    const materials: THREE.Material[] = [];

    switch (type) {
      case BlockType.GRASS: {
        const topTex = this.getTexture('grass_top', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 1);
              const g = Math.floor(140 + n * 45);
              const r = Math.floor(70 + n * 30);
              const b = Math.floor(25 + n * 20);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });

        const sideTex = this.getTexture('grass_side', (ctx) => {
          // Top 3-5 pixels grass, rest dirt
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 2);
              const grassHeight = 3 + Math.floor(this.noise(x, 0, 5) * 3);
              if (y < grassHeight) {
                const g = Math.floor(130 + n * 45);
                const r = Math.floor(65 + n * 30);
                const b = Math.floor(25 + n * 20);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
              } else {
                const r = Math.floor(115 + n * 30);
                const g = Math.floor(75 + n * 25);
                const b = Math.floor(45 + n * 20);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });

        const dirtTex = this.getTexture('dirt', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 3);
              const r = Math.floor(115 + n * 30);
              const g = Math.floor(75 + n * 25);
              const b = Math.floor(45 + n * 20);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });

        const matSide = new THREE.MeshLambertMaterial({ map: sideTex });
        const matTop = new THREE.MeshLambertMaterial({ map: topTex });
        const matBottom = new THREE.MeshLambertMaterial({ map: dirtTex });
        // Order in Three.js BoxGeometry: +x, -x, +y, -y, +z, -z
        return [matSide, matSide, matTop, matBottom, matSide, matSide];
      }

      case BlockType.DIRT: {
        const tex = this.getTexture('dirt', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 3);
              const r = Math.floor(115 + n * 30);
              const g = Math.floor(75 + n * 25);
              const b = Math.floor(45 + n * 20);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.STONE: {
        const tex = this.getTexture('stone', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 4);
              const c = Math.floor(110 + n * 40);
              ctx.fillStyle = `rgb(${c},${c},${c})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.COBBLESTONE: {
        const tex = this.getTexture('cobblestone', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 6);
              const isBorder = (x % 4 === 0 || y % 4 === 0 || (x + y) % 5 === 0);
              const c = isBorder ? Math.floor(65 + n * 25) : Math.floor(115 + n * 50);
              ctx.fillStyle = `rgb(${c},${c},${c})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.BEDROCK: {
        const tex = this.getTexture('bedrock', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 7);
              const c = n > 0.5 ? Math.floor(20 + n * 30) : Math.floor(60 + n * 40);
              ctx.fillStyle = `rgb(${c},${c},${c})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.WOOD_LOG: {
        const sideTex = this.getTexture('log_side', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, Math.floor(y / 2), 8);
              const isBarkLine = x % 3 === 0;
              const r = isBarkLine ? Math.floor(80 + n * 20) : Math.floor(105 + n * 25);
              const g = isBarkLine ? Math.floor(55 + n * 15) : Math.floor(75 + n * 20);
              const b = isBarkLine ? Math.floor(35 + n * 10) : Math.floor(45 + n * 15);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });

        const topTex = this.getTexture('log_top', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const dx = x - 7.5;
              const dy = y - 7.5;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const n = this.noise(x, y, 9);
              if (dist > 6.5) {
                // Bark ring
                ctx.fillStyle = `rgb(80,55,35)`;
              } else {
                const ring = Math.floor(dist) % 2 === 0;
                const r = ring ? Math.floor(170 + n * 20) : Math.floor(140 + n * 20);
                const g = ring ? Math.floor(135 + n * 15) : Math.floor(105 + n * 15);
                const b = ring ? Math.floor(85 + n * 10) : Math.floor(65 + n * 10);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const matSide = new THREE.MeshLambertMaterial({ map: sideTex });
        const matTop = new THREE.MeshLambertMaterial({ map: topTex });
        return [matSide, matSide, matTop, matTop, matSide, matSide];
      }

      case BlockType.WOOD_PLANKS: {
        const tex = this.getTexture('planks', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 10);
              const isSeam = y % 4 === 0 || (y < 4 && x === 8) || (y >= 4 && y < 8 && x === 3) || (y >= 8 && y < 12 && x === 12) || (y >= 12 && x === 6);
              if (isSeam) {
                ctx.fillStyle = `rgb(110,80,45)`;
              } else {
                const r = Math.floor(165 + n * 25);
                const g = Math.floor(125 + n * 20);
                const b = Math.floor(75 + n * 15);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.LEAVES: {
        const tex = this.getTexture('leaves', (ctx) => {
          ctx.clearRect(0, 0, 16, 16);
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 11);
              if (n > 0.18) {
                const g = Math.floor(115 + n * 65);
                const r = Math.floor(35 + n * 25);
                const b = Math.floor(20 + n * 20);
                ctx.fillStyle = `rgba(${r},${g},${b},0.92)`;
                ctx.fillRect(x, y, 1, 1);
              }
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.2 });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.GLASS: {
        const tex = this.getTexture('glass', (ctx) => {
          ctx.fillStyle = 'rgba(215, 240, 255, 0.2)';
          ctx.fillRect(0, 0, 16, 16);
          // Frame border
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.strokeRect(0.5, 0.5, 15, 15);
          // Glare pixels
          ctx.fillRect(2, 2, 2, 2);
          ctx.fillRect(4, 4, 1, 1);
          ctx.fillRect(10, 10, 3, 1);
          ctx.fillRect(12, 11, 2, 1);
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: 0.55 });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.SAND: {
        const tex = this.getTexture('sand', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 12);
              const r = Math.floor(215 + n * 30);
              const g = Math.floor(200 + n * 25);
              const b = Math.floor(145 + n * 25);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.SANDSTONE: {
        const sideTex = this.getTexture('sandstone_side', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 13);
              const isCrack = y === 4 || y === 12;
              const r = isCrack ? 180 : Math.floor(210 + n * 25);
              const g = isCrack ? 165 : Math.floor(195 + n * 20);
              const b = isCrack ? 120 : Math.floor(140 + n * 20);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: sideTex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.WATER: {
        const tex = this.getTexture('water', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 14);
              const r = Math.floor(25 + n * 25);
              const g = Math.floor(95 + n * 35);
              const b = Math.floor(210 + n * 45);
              ctx.fillStyle = `rgba(${r},${g},${b},0.7)`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: 0.65 });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.LAVA: {
        const tex = this.getTexture('lava', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 15);
              const r = Math.floor(220 + n * 35);
              const g = Math.floor(70 + n * 60);
              const b = Math.floor(10 + n * 20);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex, emissive: new THREE.Color(0xff4500), emissiveIntensity: 0.6 });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.BRICKS: {
        const tex = this.getTexture('bricks', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 16);
              const row = Math.floor(y / 4);
              const isMortar = y % 4 === 0 || (row % 2 === 0 ? x % 8 === 0 : (x + 4) % 8 === 0);
              if (isMortar) {
                ctx.fillStyle = `rgb(195,190,185)`;
              } else {
                const r = Math.floor(165 + n * 30);
                const g = Math.floor(65 + n * 20);
                const b = Math.floor(55 + n * 20);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.BOOKSHELF: {
        const sideTex = this.getTexture('bookshelf_side', (ctx) => {
          // Planks background
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 10);
              const r = Math.floor(165 + n * 25);
              const g = Math.floor(125 + n * 20);
              const b = Math.floor(75 + n * 15);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
          // Books shelves top and bottom
          const colors = ['#b22222', '#2e8b57', '#4169e1', '#daa520', '#8a2be2', '#c71585', '#d2691e'];
          [2, 9].forEach((shelfY) => {
            let curX = 2;
            while (curX < 14) {
              const width = 1 + (curX % 3 === 0 ? 2 : 1);
              const col = colors[(curX + shelfY) % colors.length];
              ctx.fillStyle = col;
              ctx.fillRect(curX, shelfY, width, 5);
              ctx.fillStyle = '#222';
              ctx.fillRect(curX, shelfY + 2, width, 1);
              curX += width + 1;
            }
          });
        });
        const planksTex = this.getBlockMaterials(BlockType.WOOD_PLANKS)[0];
        const matSide = new THREE.MeshLambertMaterial({ map: sideTex });
        return [matSide, matSide, planksTex, planksTex, matSide, matSide];
      }

      case BlockType.TNT: {
        const sideTex = this.getTexture('tnt_side', (ctx) => {
          ctx.fillStyle = '#b72a2a';
          ctx.fillRect(0, 0, 16, 16);
          // Top & bottom grey rope stripes
          ctx.fillStyle = '#888';
          ctx.fillRect(0, 0, 16, 2);
          ctx.fillRect(0, 14, 16, 2);
          // White band
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 5, 16, 6);
          // "TNT" letters pixel art
          ctx.fillStyle = '#000';
          // T
          ctx.fillRect(2, 6, 3, 1);
          ctx.fillRect(3, 7, 1, 3);
          // N
          ctx.fillRect(6, 6, 1, 4);
          ctx.fillRect(7, 7, 1, 1);
          ctx.fillRect(8, 8, 1, 1);
          ctx.fillRect(9, 6, 1, 4);
          // T
          ctx.fillRect(11, 6, 3, 1);
          ctx.fillRect(12, 7, 1, 3);
        });

        const topTex = this.getTexture('tnt_top', (ctx) => {
          ctx.fillStyle = '#b72a2a';
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = '#444';
          ctx.fillRect(6, 6, 4, 4);
          ctx.fillStyle = '#eee';
          ctx.fillRect(7, 7, 2, 2);
        });

        const matSide = new THREE.MeshLambertMaterial({ map: sideTex });
        const matTop = new THREE.MeshLambertMaterial({ map: topTex });
        return [matSide, matSide, matTop, matTop, matSide, matSide];
      }

      case BlockType.OBSIDIAN: {
        const tex = this.getTexture('obsidian', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 17);
              const r = Math.floor(25 + n * 20);
              const g = Math.floor(15 + n * 15);
              const b = Math.floor(35 + n * 35);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.DIAMOND_BLOCK: {
        const tex = this.getTexture('diamond_block', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 18);
              const isBorder = x === 0 || x === 15 || y === 0 || y === 15;
              const r = isBorder ? 70 : Math.floor(100 + n * 60);
              const g = isBorder ? 210 : Math.floor(225 + n * 30);
              const b = isBorder ? 215 : Math.floor(235 + n * 20);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.GOLD_BLOCK: {
        const tex = this.getTexture('gold_block', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 19);
              const isBorder = x === 0 || x === 15 || y === 0 || y === 15;
              const r = isBorder ? 215 : Math.floor(245 + n * 10);
              const g = isBorder ? 175 : Math.floor(215 + n * 30);
              const b = isBorder ? 45 : Math.floor(65 + n * 40);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.EMERALD_BLOCK: {
        const tex = this.getTexture('emerald_block', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 20);
              const isBorder = x === 0 || x === 15 || y === 0 || y === 15;
              const r = isBorder ? 20 : Math.floor(40 + n * 30);
              const g = isBorder ? 170 : Math.floor(210 + n * 45);
              const b = isBorder ? 70 : Math.floor(95 + n * 40);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.IRON_BLOCK: {
        const tex = this.getTexture('iron_block', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 21);
              const isBorder = x === 0 || x === 15 || y === 0 || y === 15;
              const c = isBorder ? 180 : Math.floor(215 + n * 35);
              ctx.fillStyle = `rgb(${c},${c},${c})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.REDSTONE_BLOCK: {
        const tex = this.getTexture('redstone_block', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 22);
              const r = Math.floor(180 + n * 70);
              const g = Math.floor(15 + n * 20);
              const b = Math.floor(15 + n * 20);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex, emissive: new THREE.Color(0xaa0000), emissiveIntensity: 0.35 });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.GLOWSTONE: {
        const tex = this.getTexture('glowstone', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 23);
              const r = Math.floor(235 + n * 20);
              const g = Math.floor(190 + n * 50);
              const b = Math.floor(110 + n * 40);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex, emissive: new THREE.Color(0xffe680), emissiveIntensity: 0.8 });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.COAL_ORE:
      case BlockType.IRON_ORE:
      case BlockType.GOLD_ORE:
      case BlockType.DIAMOND_ORE: {
        const oreKey = `ore_${type}`;
        const tex = this.getTexture(oreKey, (ctx) => {
          // Stone base
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 4);
              const c = Math.floor(110 + n * 40);
              ctx.fillStyle = `rgb(${c},${c},${c})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
          // Ore specks
          const oreColor = 
            type === BlockType.COAL_ORE ? '#222222' :
            type === BlockType.IRON_ORE ? '#d8af93' :
            type === BlockType.GOLD_ORE ? '#fcee4b' : '#5cf0e5';
          
          const spots = [[3,3],[4,3],[3,4],[8,7],[9,7],[8,8],[9,8],[12,4],[13,4],[4,11],[5,11],[11,12],[12,12]];
          ctx.fillStyle = oreColor;
          spots.forEach(([ox, oy]) => {
            ctx.fillRect(ox, oy, 1, 1);
          });
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.NETHERRACK: {
        const tex = this.getTexture('netherrack', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 92);
              const n2 = this.noise(x * 2, y * 2, 93);
              const isDark = n + n2 < 0.85;
              const isBlood = n * 1.5 + n2 > 1.35;
              const r = isDark ? Math.floor(80 + n * 25) : isBlood ? Math.floor(165 + n * 45) : Math.floor(125 + n * 35);
              const g = isDark ? Math.floor(18 + n * 10) : isBlood ? Math.floor(38 + n * 15) : Math.floor(28 + n * 15);
              const b = isDark ? Math.floor(20 + n * 10) : isBlood ? Math.floor(38 + n * 15) : Math.floor(28 + n * 15);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.END_STONE: {
        const tex = this.getTexture('end_stone', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 94);
              const n2 = this.noise(x * 3, y * 3, 95);
              const crater = n * 0.7 + n2 * 0.3;
              const r = Math.floor(215 + crater * 30);
              const g = Math.floor(220 + crater * 28);
              const b = Math.floor(165 + crater * 35);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.CRAFTING_TABLE: {
        const topTex = this.getTexture('crafting_top', (ctx) => {
          ctx.fillStyle = '#b5844a';
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = '#6b4c27';
          ctx.strokeRect(2.5, 2.5, 11, 11);
          ctx.beginPath();
          ctx.moveTo(8, 3); ctx.lineTo(8, 13);
          ctx.moveTo(3, 8); ctx.lineTo(13, 8);
          ctx.stroke();
        });
        const sideTex = this.getTexture('crafting_side', (ctx) => {
          ctx.fillStyle = '#9c6f3b';
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = '#4a3319';
          ctx.fillRect(2, 4, 12, 8);
          ctx.fillStyle = '#c7985c';
          ctx.fillRect(3, 5, 10, 6);
          // mini tool
          ctx.fillStyle = '#333';
          ctx.fillRect(5, 7, 6, 2);
        });
        const planksTex = this.getBlockMaterials(BlockType.WOOD_PLANKS)[0];
        const matSide = new THREE.MeshLambertMaterial({ map: sideTex });
        const matTop = new THREE.MeshLambertMaterial({ map: topTex });
        return [matSide, matSide, matTop, planksTex, matSide, matSide];
      }

      case BlockType.FURNACE: {
        const frontTex = this.getTexture('furnace_front', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 6);
              const c = Math.floor(100 + n * 40);
              ctx.fillStyle = `rgb(${c},${c},${c})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
          // Mouth
          ctx.fillStyle = '#222';
          ctx.fillRect(4, 8, 8, 5);
          ctx.fillStyle = '#ff6600';
          ctx.fillRect(6, 10, 4, 3);
          ctx.fillStyle = '#ffcc00';
          ctx.fillRect(7, 11, 2, 2);
        });
        const cobbleTex = this.getBlockMaterials(BlockType.COBBLESTONE)[0];
        const matFront = new THREE.MeshLambertMaterial({ map: frontTex });
        return [cobbleTex, cobbleTex, cobbleTex, cobbleTex, matFront, cobbleTex];
      }

      case BlockType.PUMPKIN: {
        const sideTex = this.getTexture('pumpkin_side', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 25);
              const isRib = x % 4 === 0;
              const r = isRib ? 190 : Math.floor(225 + n * 25);
              const g = isRib ? 95 : Math.floor(125 + n * 25);
              const b = isRib ? 15 : Math.floor(25 + n * 15);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const topTex = this.getTexture('pumpkin_top', (ctx) => {
          ctx.fillStyle = '#d67418';
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = '#4a752c';
          ctx.fillRect(7, 7, 2, 2);
        });
        const matSide = new THREE.MeshLambertMaterial({ map: sideTex });
        const matTop = new THREE.MeshLambertMaterial({ map: topTex });
        return [matSide, matSide, matTop, matTop, matSide, matSide];
      }

      // Wool Blocks (Colors)
      case BlockType.WOOL_WHITE:
      case BlockType.WOOL_RED:
      case BlockType.WOOL_BLUE:
      case BlockType.WOOL_GREEN:
      case BlockType.WOOL_YELLOW:
      case BlockType.WOOL_BLACK:
      case BlockType.WOOL_PINK:
      case BlockType.WOOL_PURPLE:
      case BlockType.WOOL_ORANGE:
      case BlockType.WOOL_CYAN: {
        const woolColors: { [key: number]: [number, number, number] } = {
          [BlockType.WOOL_WHITE]: [235, 235, 235],
          [BlockType.WOOL_RED]: [180, 40, 40],
          [BlockType.WOOL_BLUE]: [45, 75, 185],
          [BlockType.WOOL_GREEN]: [60, 145, 45],
          [BlockType.WOOL_YELLOW]: [230, 205, 45],
          [BlockType.WOOL_BLACK]: [30, 30, 30],
          [BlockType.WOOL_PINK]: [235, 130, 165],
          [BlockType.WOOL_PURPLE]: [130, 45, 175],
          [BlockType.WOOL_ORANGE]: [230, 115, 30],
          [BlockType.WOOL_CYAN]: [35, 145, 160],
        };
        const [baseR, baseG, baseB] = woolColors[type] || [200, 200, 200];
        const tex = this.getTexture(`wool_${type}`, (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = (this.noise(x, y, 26) - 0.5) * 30;
              const r = Math.min(255, Math.max(0, Math.floor(baseR + n)));
              const g = Math.min(255, Math.max(0, Math.floor(baseG + n)));
              const b = Math.min(255, Math.max(0, Math.floor(baseB + n)));
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.BED_RED:
      case BlockType.BED_BLUE:
      case BlockType.BED_WHITE:
      case BlockType.BED_GREEN: {
        const bedColors: Record<number, [number, number, number]> = {
          [BlockType.BED_RED]: [185, 38, 38],
          [BlockType.BED_BLUE]: [45, 95, 195],
          [BlockType.BED_WHITE]: [225, 225, 225],
          [BlockType.BED_GREEN]: [50, 150, 50],
        };
        const [bR, bG, bB] = bedColors[type] || [185, 38, 38];

        // Top face: White Pillow on one end, colored blanket with folds on the rest
        const topTex = this.getTexture(`bed_top_${type}`, (ctx) => {
          // Pillow (top 5 rows: y = 0..4)
          for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 16; x++) {
              const isPillowMargin = x <= 1 || x >= 14 || y === 0 || y === 4;
              const brightness = isPillowMargin ? 210 : 240 + Math.floor(this.noise(x, y, 31) * 15);
              ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
          // Blanket (rows 5..15)
          for (let y = 5; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = (this.noise(x, y, 32) - 0.5) * 20;
              const isBorder = y === 5 || y === 15 || x === 0 || x === 15;
              const shade = isBorder ? -25 : 0;
              const r = Math.min(255, Math.max(0, Math.floor(bR + n + shade)));
              const g = Math.min(255, Math.max(0, Math.floor(bG + n + shade)));
              const b = Math.min(255, Math.max(0, Math.floor(bB + n + shade)));
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });

        // Side faces: Blanket/mattress on top half, wooden frame & legs on bottom half
        const sideTex = this.getTexture(`bed_side_${type}`, (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              if (y < 3 && x < 5) {
                // Pillow side edge
                const bright = 220 + Math.floor(this.noise(x, y, 33) * 20);
                ctx.fillStyle = `rgb(${bright},${bright},${bright})`;
              } else if (y < 8) {
                // Blanket / mattress
                const n = (this.noise(x, y, 34) - 0.5) * 20;
                const r = Math.min(255, Math.max(0, Math.floor(bR + n)));
                const g = Math.min(255, Math.max(0, Math.floor(bG + n)));
                const b = Math.min(255, Math.max(0, Math.floor(bB + n)));
                ctx.fillStyle = `rgb(${r},${g},${b})`;
              } else {
                // Wood frame (with legs at x <= 2 and x >= 13)
                const isLeg = (x <= 2 || x >= 13) || y >= 12;
                if (isLeg) {
                  const woodN = this.noise(x, y, 35) * 25;
                  ctx.fillStyle = `rgb(${Math.floor(130 + woodN)},${Math.floor(90 + woodN)},${Math.floor(50 + woodN)})`;
                } else {
                  ctx.fillStyle = '#1c1208';
                }
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });

        // Wood Bottom face
        const bottomTex = this.getTexture('bed_bottom', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const woodN = this.noise(x, y, 36) * 20;
              ctx.fillStyle = `rgb(${Math.floor(140 + woodN)},${Math.floor(95 + woodN)},${Math.floor(55 + woodN)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });

        const matTop = new THREE.MeshLambertMaterial({ map: topTex });
        const matSide = new THREE.MeshLambertMaterial({ map: sideTex });
        const matBottom = new THREE.MeshLambertMaterial({ map: bottomTex });

        return [matSide, matSide, matTop, matBottom, matSide, matSide];
      }

      case BlockType.CHOCOLATE_BLOCK: {
        const tex = this.getTexture('chocolate_block', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = (this.noise(x, y, 40) - 0.5) * 8;
              const isBorder = x === 0 || x === 15 || y === 0 || y === 15 || x === 7 || x === 8 || y === 7 || y === 8;
              const isHighlight = (x === 1 || x === 9) && (y > 0 && y < 15 && y !== 7 && y !== 8);
              const isShadow = (x === 6 || x === 14) || (y === 6 || y === 14);

              let r = 110 + n;
              let g = 60 + n;
              let b = 28 + n;

              if (isBorder) {
                r -= 25; g -= 18; b -= 10;
              } else if (isHighlight) {
                r += 24; g += 16; b += 8;
              } else if (isShadow) {
                r -= 18; g -= 12; b -= 6;
              }

              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.DARK_CHOCOLATE: {
        const tex = this.getTexture('dark_chocolate', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = (this.noise(x, y, 41) - 0.5) * 6;
              const isBevel = x === 0 || x === 15 || y === 0 || y === 15 || x === 7 || y === 7;
              const r = isBevel ? 45 + n : 65 + n;
              const g = isBevel ? 20 + n : 32 + n;
              const b = isBevel ? 8 + n : 15 + n;
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.WHITE_CHOCOLATE: {
        const tex = this.getTexture('white_chocolate', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = (this.noise(x, y, 42) - 0.5) * 6;
              const isBevel = x === 0 || x === 15 || y === 0 || y === 15 || x === 7 || y === 7;
              const r = isBevel ? 220 + n : 245 + n;
              const g = isBevel ? 205 + n : 235 + n;
              const b = isBevel ? 175 + n : 205 + n;
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.LIQUID_CHOCOLATE: {
        const tex = this.getTexture('liquid_chocolate', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const wave = Math.sin(x * 0.6 + y * 0.4) * 12;
              const n = this.noise(x, y, 43) * 10;
              const r = 90 + wave + n;
              const g = 45 + wave * 0.6 + n * 0.5;
              const b = 18 + wave * 0.3;
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: 0.92 });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.COOKIE_BLOCK: {
        const tex = this.getTexture('cookie_block', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = (this.noise(x, y, 44) - 0.5) * 20;
              let r = 215 + n;
              let g = 160 + n * 0.8;
              let b = 85 + n * 0.5;

              const isChip =
                (x >= 3 && x <= 4 && y >= 3 && y <= 4) ||
                (x >= 10 && x <= 12 && y >= 4 && y <= 5) ||
                (x >= 4 && x <= 5 && y >= 10 && y <= 11) ||
                (x >= 10 && x <= 11 && y >= 11 && y <= 12) ||
                (x >= 7 && x <= 8 && y >= 7 && y <= 8);

              if (isChip) {
                r = 55 + (this.noise(x, y, 45) - 0.5) * 15;
                g = 28;
                b = 12;
              }

              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.CARAMEL_STONE: {
        const tex = this.getTexture('caramel_stone', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x * 0.4, y * 0.4, 46) * 35;
              const r = 190 + n * 0.8;
              const g = 105 + n * 0.6;
              const b = 25 + n * 0.3;
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.WAFFLE_BLOCK: {
        const tex = this.getTexture('waffle_block', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const isGrid = x % 4 === 0 || y % 4 === 0;
              const n = (this.noise(x, y, 47) - 0.5) * 12;
              const r = isGrid ? 210 + n : 160 + n;
              const g = isGrid ? 150 + n : 95 + n;
              const b = isGrid ? 70 + n : 40 + n;
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.COTTON_CANDY_PINK: {
        const tex = this.getTexture('cotton_candy_pink', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = (this.noise(x, y, 48) - 0.5) * 25;
              const r = 245 + n;
              const g = 125 + n * 0.8;
              const b = 185 + n;
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: 0.88 });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.COTTON_CANDY_BLUE: {
        const tex = this.getTexture('cotton_candy_blue', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = (this.noise(x, y, 49) - 0.5) * 25;
              const r = 110 + n;
              const g = 185 + n;
              const b = 250 + n;
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: 0.88 });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.CANDY_CANE_BLOCK: {
        const tex = this.getTexture('candy_cane_block', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const isRed = (x + y) % 6 < 3;
              const n = (this.noise(x, y, 50) - 0.5) * 10;
              if (isRed) {
                ctx.fillStyle = `rgb(${Math.floor(235 + n)},${Math.floor(35 + n)},${Math.floor(35 + n)})`;
              } else {
                ctx.fillStyle = `rgb(${Math.floor(245 + n)},${Math.floor(245 + n)},${Math.floor(245 + n)})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.SUGAR_ORE: {
        const tex = this.getTexture('sugar_ore', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = (this.noise(x, y, 51) - 0.5) * 20;
              let r = 180 + n;
              let g = 100 + n * 0.7;
              let b = 40 + n * 0.4;
              const isCrystal = (x >= 4 && x <= 6 && y >= 3 && y <= 5) || (x >= 10 && x <= 13 && y >= 9 && y <= 12) || (x >= 3 && x <= 5 && y >= 11 && y <= 13);
              if (isCrystal) {
                r = 230 + (this.noise(x, y, 52) - 0.5) * 25;
                g = 245;
                b = 255;
              }
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.PORTAL_CHOCOLATE: {
        const tex = this.getTexture('portal_chocolate', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const dist = Math.sqrt((x - 7.5) ** 2 + (y - 7.5) ** 2);
              const angle = Math.atan2(y - 7.5, x - 7.5);
              const swirl = Math.sin(angle * 3 + dist * 0.8) * 35;
              const spark = this.noise(x, y, 53) > 0.82 ? 60 : 0;
              const r = Math.min(255, 140 + swirl + spark);
              const g = Math.min(255, 75 + swirl * 0.7 + spark);
              const b = Math.min(255, 25 + spark * 0.5);
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({
          map: tex,
          transparent: true,
          opacity: 0.82,
          emissive: new THREE.Color(0x5a2d0c),
          emissiveIntensity: 0.5,
        });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.PORTAL_NETHER: {
        const tex = this.getTexture('portal_nether', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const dist = Math.sqrt((x - 7.5) ** 2 + (y - 7.5) ** 2);
              const angle = Math.atan2(y - 7.5, x - 7.5);
              const swirl = Math.sin(angle * 2 + dist * 0.7) * 40;
              const r = Math.min(255, 150 + swirl);
              const g = Math.min(255, 25 + swirl * 0.3);
              const b = Math.min(255, 230 + swirl * 0.5);
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({
          map: tex,
          transparent: true,
          opacity: 0.82,
          emissive: new THREE.Color(0x4a0e68),
          emissiveIntensity: 0.6,
        });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.PORTAL_END: {
        const tex = this.getTexture('portal_end', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const star = this.noise(x, y, 54) > 0.85;
              if (star) {
                ctx.fillStyle = '#67e8f9';
              } else {
                const n = this.noise(x, y, 55) * 20;
                ctx.fillStyle = `rgb(${Math.floor(10 + n)},${Math.floor(18 + n)},${Math.floor(26 + n)})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({
          map: tex,
          transparent: true,
          opacity: 0.9,
          emissive: new THREE.Color(0x064e3b),
          emissiveIntensity: 0.5,
        });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.PURPUR_BLOCK: {
        const tex = this.getTexture('purpur_block', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const isBorder = x === 0 || x === 15 || y === 0 || y === 15;
              const n = (this.noise(x, y, 56) - 0.5) * 15;
              const r = isBorder ? 145 + n : 175 + n;
              const g = isBorder ? 85 + n : 115 + n;
              const b = isBorder ? 185 + n : 215 + n;
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.SOUL_SAND: {
        const tex = this.getTexture('soul_sand', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = (this.noise(x, y, 57) - 0.5) * 25;
              const isSoulFace = (x === 4 || x === 7 || x === 11 || x === 14) && (y === 5 || y === 11);
              const r = isSoulFace ? 45 : 85 + n;
              const g = isSoulFace ? 30 : 65 + n * 0.8;
              const b = isSoulFace ? 20 : 50 + n * 0.6;
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.NETHER_BRICKS: {
        const tex = this.getTexture('nether_bricks', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const isMortar = y % 4 === 0 || (y < 4 && x === 8) || (y >= 4 && y < 8 && (x === 0 || x === 15)) || (y >= 8 && y < 12 && x === 8) || (y >= 12 && (x === 0 || x === 15));
              const n = (this.noise(x, y, 58) - 0.5) * 15;
              const r = isMortar ? 35 : 75 + n;
              const g = isMortar ? 10 : 20 + n * 0.4;
              const b = isMortar ? 15 : 28 + n * 0.4;
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.QUARTZ_ORE: {
        const tex = this.getTexture('quartz_ore', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = (this.noise(x, y, 59) - 0.5) * 20;
              let r = 110 + n;
              let g = 25 + n * 0.4;
              let b = 25 + n * 0.4;
              const isQuartz = (x >= 4 && x <= 7 && y >= 4 && y <= 7) || (x >= 9 && x <= 12 && y >= 8 && y <= 11);
              if (isQuartz) {
                r = 235 + (this.noise(x, y, 60) - 0.5) * 15;
                g = 230;
                b = 225;
              }
              ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.PORTAL_PARALLEL: {
        const tex = this.getTexture('portal_parallel', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const swirl = Math.sin((x + y) * 0.8) * Math.cos((x - y) * 0.8);
              const n = this.noise(x, y, 77);
              const isBeam = (x + y) % 5 === 0;
              if (isBeam) {
                ctx.fillStyle = '#00ffff';
              } else if (swirl > 0) {
                ctx.fillStyle = `rgb(${Math.floor(220 + n * 35)},${Math.floor(20 + n * 40)},${Math.floor(220 + n * 35)})`;
              } else {
                ctx.fillStyle = `rgb(${Math.floor(10 + n * 30)},${Math.floor(180 + n * 60)},${Math.floor(240 + n * 15)})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({
          map: tex,
          transparent: true,
          opacity: 0.88,
          emissive: new THREE.Color(0x00d8ff),
          emissiveIntensity: 0.65,
        });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.PARALLEL_MIRROR_BLOCK: {
        const tex = this.getTexture('parallel_mirror', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const isBorder = x === 0 || x === 15 || y === 0 || y === 15;
              const n = (this.noise(x, y, 78) - 0.5) * 20;
              if (isBorder) {
                ctx.fillStyle = '#00ffff';
              } else {
                const isSheen = (x + y * 2) % 6 === 0;
                const base = isSheen ? 220 : 70 + n;
                ctx.fillStyle = `rgb(${Math.floor(base * 0.3)},${Math.floor(base * 0.85)},${Math.floor(base)})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({
          map: tex,
          emissive: new THREE.Color(0x005577),
          emissiveIntensity: 0.3,
        });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.PARALLEL_GRASS: {
        // Inverted grass: Neon Magenta top, Cyan dirt bottom
        const topTex = this.getTexture('parallel_grass_top', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 79);
              const r = Math.floor(185 + n * 50);
              const g = Math.floor(20 + n * 30);
              const b = Math.floor(220 + n * 35);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });

        const sideTex = this.getTexture('parallel_grass_side', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 80);
              const grassHeight = 3 + Math.floor(this.noise(x, 0, 81) * 3);
              if (y < grassHeight) {
                const r = Math.floor(180 + n * 45);
                const g = Math.floor(20 + n * 30);
                const b = Math.floor(215 + n * 40);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
              } else {
                // Inverted dirt: deep cyan
                const r = Math.floor(20 + n * 20);
                const g = Math.floor(115 + n * 35);
                const b = Math.floor(145 + n * 30);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });

        const dirtTex = this.getTexture('parallel_dirt', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 82);
              const r = Math.floor(20 + n * 20);
              const g = Math.floor(115 + n * 35);
              const b = Math.floor(145 + n * 30);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });

        const matSide = new THREE.MeshLambertMaterial({ map: sideTex });
        const matTop = new THREE.MeshLambertMaterial({ map: topTex });
        const matBottom = new THREE.MeshLambertMaterial({ map: dirtTex });
        return [matSide, matSide, matTop, matBottom, matSide, matSide];
      }

      case BlockType.PARALLEL_DIRT: {
        const tex = this.getTexture('parallel_dirt', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 82);
              const r = Math.floor(20 + n * 20);
              const g = Math.floor(115 + n * 35);
              const b = Math.floor(145 + n * 30);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.PARALLEL_STONE: {
        const tex = this.getTexture('parallel_stone', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 83);
              const isVein = (x * 3 + y * 2) % 7 === 0;
              if (isVein) {
                ctx.fillStyle = '#ff55ee';
              } else {
                const c = Math.floor(35 + n * 35);
                ctx.fillStyle = `rgb(${c + 20},${c},${c + 40})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.PARALLEL_WOOD: {
        const sideTex = this.getTexture('parallel_wood_side', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const isStripe = x % 4 === 0;
              const n = this.noise(x, y, 84) * 20;
              const base = isStripe ? 60 : 130 + n;
              ctx.fillStyle = `rgb(${Math.floor(base * 0.3)},${Math.floor(base * 0.8)},${Math.floor(base * 0.95)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const topTex = this.getTexture('parallel_wood_top', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const dx = x - 7.5;
              const dy = y - 7.5;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const ring = Math.floor(dist) % 2 === 0;
              const base = ring ? 140 : 80;
              ctx.fillStyle = `rgb(${Math.floor(base * 0.2)},${Math.floor(base * 0.7)},${Math.floor(base * 0.9)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const matSide = new THREE.MeshLambertMaterial({ map: sideTex });
        const matTop = new THREE.MeshLambertMaterial({ map: topTex });
        return [matSide, matSide, matTop, matTop, matSide, matSide];
      }

      case BlockType.PARALLEL_LEAVES: {
        const tex = this.getTexture('parallel_leaves', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const isHole = this.noise(x, y, 85) > 0.7;
              if (isHole) {
                ctx.fillStyle = 'rgba(0,0,0,0)';
              } else {
                const n = this.noise(x, y, 86);
                ctx.fillStyle = `rgb(${Math.floor(200 + n * 45)},${Math.floor(30 + n * 40)},${Math.floor(220 + n * 35)})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({
          map: tex,
          transparent: true,
          opacity: 0.85,
        });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.PARALLEL_WATER: {
        const tex = this.getTexture('parallel_water', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 87);
              // Inverted water: fiery gold/crimson
              ctx.fillStyle = `rgb(${Math.floor(235 + n * 20)},${Math.floor(110 + n * 40)},${Math.floor(20 + n * 30)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({
          map: tex,
          transparent: true,
          opacity: 0.75,
        });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.PARALLEL_SAND: {
        const tex = this.getTexture('parallel_sand', (ctx) => {
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 88);
              // Inverted sand: dark navy indigo
              ctx.fillStyle = `rgb(${Math.floor(25 + n * 20)},${Math.floor(25 + n * 25)},${Math.floor(80 + n * 35)})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.COMMAND_BLOCK: {
        const tex = this.getTexture('command_block', (ctx) => {
          // Bronze/Amber casing
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 42);
              const isBorder = x === 0 || x === 15 || y === 0 || y === 15;
              const isInnerBorder = x === 1 || x === 14 || y === 1 || y === 14;
              if (isBorder) {
                ctx.fillStyle = `rgb(${Math.floor(130 + n * 20)}, ${Math.floor(65 + n * 15)}, ${Math.floor(20 + n * 10)})`;
              } else if (isInnerBorder) {
                ctx.fillStyle = `rgb(${Math.floor(190 + n * 20)}, ${Math.floor(110 + n * 15)}, ${Math.floor(45 + n * 10)})`;
              } else {
                ctx.fillStyle = `rgb(${Math.floor(175 + n * 25)}, ${Math.floor(95 + n * 20)}, ${Math.floor(35 + n * 15)})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
          // Central control plate
          ctx.fillStyle = '#334155';
          ctx.fillRect(4, 4, 8, 8);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(5, 5, 6, 6);
          // Glowing center pulse core (Cyan / Gold)
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(6, 6, 4, 4);
          ctx.fillStyle = '#f0fdf4';
          ctx.fillRect(7, 7, 2, 2);
          // Corner indicator LEDs
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(3, 3, 1, 1);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(12, 3, 1, 1);
          ctx.fillStyle = '#eab308';
          ctx.fillRect(3, 12, 1, 1);
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(12, 12, 1, 1);
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.STRUCTURE_BLOCK: {
        const tex = this.getTexture('structure_block', (ctx) => {
          // Deep Slate / Obsidian casing
          for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
              const n = this.noise(x, y, 77);
              const isBorder = x === 0 || x === 15 || y === 0 || y === 15;
              const isCorner = (x <= 2 || x >= 13) && (y <= 2 || y >= 13);
              if (isCorner) {
                ctx.fillStyle = `rgb(${Math.floor(70 + n * 20)}, ${Math.floor(80 + n * 20)}, ${Math.floor(95 + n * 20)})`;
              } else if (isBorder) {
                ctx.fillStyle = `rgb(${Math.floor(30 + n * 15)}, ${Math.floor(35 + n * 15)}, ${Math.floor(45 + n * 15)})`;
              } else {
                ctx.fillStyle = `rgb(${Math.floor(40 + n * 15)}, ${Math.floor(48 + n * 15)}, ${Math.floor(60 + n * 15)})`;
              }
              ctx.fillRect(x, y, 1, 1);
            }
          }
          // Cyan glowing holographic structural cube logo
          ctx.fillStyle = '#06b6d4';
          // Outer frame of cube
          ctx.fillRect(5, 5, 6, 1);
          ctx.fillRect(5, 10, 6, 1);
          ctx.fillRect(5, 5, 1, 6);
          ctx.fillRect(10, 5, 1, 6);
          // Hologram cross / isometric depth
          ctx.fillStyle = '#67e8f9';
          ctx.fillRect(7, 7, 2, 2);
          ctx.fillStyle = '#cffafe';
          ctx.fillRect(7, 7, 1, 1);
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }

      case BlockType.BARRIER: {
        const tex = this.getTexture('barrier', (ctx) => {
          ctx.clearRect(0, 0, 16, 16);
          // Red prohibited circle with slash (Minecraft Admin Barrier icon)
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(8, 8, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(4, 4);
          ctx.lineTo(12, 12);
          ctx.stroke();
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: 0.85, alphaTest: 0.1 });
        return [mat, mat, mat, mat, mat, mat];
      }

      default: {
        const tex = this.getTexture('default', (ctx) => {
          ctx.fillStyle = '#ff00ff';
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, 8, 8);
          ctx.fillRect(8, 8, 8, 8);
        });
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        return [mat, mat, mat, mat, mat, mat];
      }
    }
  }

  // Cracking animation overlay texture
  public getCrackTexture(stage: number): THREE.CanvasTexture {
    const key = `crack_${stage}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.createPixelCanvas(16, 16);
    ctx.clearRect(0, 0, 16, 16);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';

    const numCracks = Math.min(10, Math.max(1, stage + 1));
    for (let i = 0; i < numCracks; i++) {
      const x = Math.floor(this.noise(i, stage, 99) * 14) + 1;
      const y = Math.floor(this.noise(stage, i, 99) * 14) + 1;
      ctx.fillRect(x, y, 2, 2);
      ctx.fillRect(x - 1, y, 1, 1);
      ctx.fillRect(x + 1, y + 1, 1, 1);
    }

    const texture = this.wrapTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }
}

export const textureGen = new TextureGenerator();

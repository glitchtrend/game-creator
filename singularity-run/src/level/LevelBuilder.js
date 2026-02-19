import * as THREE from 'three';
import { TUNNEL, COLORS } from '../core/Constants.js';

export class LevelBuilder {
  constructor(scene) {
    this.scene = scene;
    this.segments = [];
    this.particles = [];

    this.buildLighting();
    this.buildFog();
    this.buildTunnel();
    this.buildFloor();
    this.buildParticles();
  }

  buildLighting() {
    const ambient = new THREE.AmbientLight(COLORS.AMBIENT_LIGHT, COLORS.AMBIENT_INTENSITY);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(COLORS.DIR_LIGHT, COLORS.DIR_INTENSITY);
    directional.position.set(0, 10, 5);
    this.scene.add(directional);

    // Point light that follows the player (will be moved in update)
    this.playerLight = new THREE.PointLight(0x00ff66, 0.8, 30);
    this.playerLight.position.set(0, 3, 0);
    this.scene.add(this.playerLight);
  }

  buildFog() {
    this.scene.fog = new THREE.Fog(COLORS.FOG_COLOR, COLORS.FOG_NEAR, COLORS.FOG_FAR);
  }

  buildTunnel() {
    // Create wireframe tunnel segments
    this._tunnelGeo = new THREE.BoxGeometry(
      TUNNEL.WIDTH,
      TUNNEL.HEIGHT,
      TUNNEL.SEGMENT_LENGTH
    );
    this._tunnelMat = new THREE.MeshBasicMaterial({
      color: TUNNEL.COLOR,
      wireframe: TUNNEL.WIREFRAME,
      transparent: true,
      opacity: TUNNEL.OPACITY,
    });

    for (let i = 0; i < TUNNEL.VISIBLE_SEGMENTS; i++) {
      const segment = new THREE.Mesh(this._tunnelGeo, this._tunnelMat);
      // Position segments extending into -Z
      segment.position.set(0, TUNNEL.HEIGHT * 0.5 - 0.5, -i * TUNNEL.SEGMENT_LENGTH);
      this.scene.add(segment);
      this.segments.push(segment);
    }
  }

  buildFloor() {
    // Dark green floor extending far into the distance
    const floorGeo = new THREE.PlaneGeometry(TUNNEL.WIDTH, TUNNEL.SEGMENT_LENGTH * TUNNEL.VISIBLE_SEGMENTS * 2);
    const floorMat = new THREE.MeshPhongMaterial({
      color: TUNNEL.FLOOR_COLOR,
      emissive: 0x001100,
      emissiveIntensity: 0.3,
    });
    this.floor = new THREE.Mesh(floorGeo, floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -0.01; // Slightly below ground to avoid z-fighting
    this.scene.add(this.floor);

    this._floorGeo = floorGeo;
    this._floorMat = floorMat;
  }

  buildParticles() {
    // Floating green code particles (simple points)
    const count = 200;
    const positions = new Float32Array(count * 3);
    const spread = TUNNEL.WIDTH * 0.4;
    const depth = TUNNEL.SEGMENT_LENGTH * TUNNEL.VISIBLE_SEGMENTS;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread * 2;
      positions[i * 3 + 1] = Math.random() * TUNNEL.HEIGHT;
      positions[i * 3 + 2] = -Math.random() * depth;
    }

    this._particleGeo = new THREE.BufferGeometry();
    this._particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this._particleMat = new THREE.PointsMaterial({
      color: 0x00ff00,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });

    this.particleSystem = new THREE.Points(this._particleGeo, this._particleMat);
    this.scene.add(this.particleSystem);
  }

  /** Update tunnel segments and floor to follow the player */
  update(playerZ) {
    // Recycle tunnel segments
    const totalLength = TUNNEL.SEGMENT_LENGTH * TUNNEL.VISIBLE_SEGMENTS;
    for (const segment of this.segments) {
      // If segment is behind the player, move it to the front
      if (segment.position.z > playerZ + TUNNEL.SEGMENT_LENGTH) {
        // Find the frontmost segment Z
        let minZ = Infinity;
        for (const s of this.segments) {
          if (s.position.z < minZ) minZ = s.position.z;
        }
        segment.position.z = minZ - TUNNEL.SEGMENT_LENGTH;
      }
    }

    // Move floor to follow player
    this.floor.position.z = playerZ - totalLength * 0.5;

    // Move player light
    this.playerLight.position.z = playerZ;

    // Move particle system to follow player (keep surrounding the player)
    this.particleSystem.position.z = playerZ;
  }

  /** Reset tunnel to initial positions (for restart) */
  reset() {
    for (let i = 0; i < this.segments.length; i++) {
      this.segments[i].position.z = -i * TUNNEL.SEGMENT_LENGTH;
    }
    this.floor.position.z = 0;
    this.playerLight.position.set(0, 3, 0);
    this.particleSystem.position.z = 0;
  }

  dispose() {
    for (const seg of this.segments) {
      this.scene.remove(seg);
    }
    this._tunnelGeo.dispose();
    this._tunnelMat.dispose();
    this.scene.remove(this.floor);
    this._floorGeo.dispose();
    this._floorMat.dispose();
    this.scene.remove(this.particleSystem);
    this._particleGeo.dispose();
    this._particleMat.dispose();
    this.scene.remove(this.playerLight);
  }
}

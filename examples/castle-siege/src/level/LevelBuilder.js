// =============================================================================
// LevelBuilder.js — Terrain, path, lighting, fog, sky
// Builds the medieval battlefield environment.
// =============================================================================

import * as THREE from 'three';
import { LEVEL, COLORS } from '../core/Constants.js';

export class LevelBuilder {
  constructor(scene) {
    this.scene = scene;

    this.buildGround();
    this.buildPath();
    this.buildLighting();
    this.buildFog();
    this.buildSkyGradient();
    this.buildDecor();
  }

  buildGround() {
    const geometry = new THREE.PlaneGeometry(LEVEL.GROUND_SIZE, LEVEL.GROUND_SIZE, 8, 8);
    const material = new THREE.MeshLambertMaterial({ color: LEVEL.GROUND_COLOR });
    this.ground = new THREE.Mesh(geometry, material);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.ground.name = 'ground';
    this.scene.add(this.ground);
  }

  buildPath() {
    // Dirt path from spawn end to castle
    const pathGeo = new THREE.PlaneGeometry(LEVEL.PATH_WIDTH, LEVEL.GROUND_SIZE);
    const pathMat = new THREE.MeshLambertMaterial({ color: LEVEL.PATH_COLOR });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.01; // Slightly above ground to avoid z-fighting
    path.receiveShadow = true;
    this.scene.add(path);
  }

  buildLighting() {
    // Ambient fill
    const ambient = new THREE.AmbientLight(COLORS.AMBIENT_LIGHT, COLORS.AMBIENT_INTENSITY);
    this.scene.add(ambient);

    // Main directional light (sun) with shadows
    const directional = new THREE.DirectionalLight(COLORS.DIR_LIGHT, COLORS.DIR_INTENSITY);
    directional.position.set(15, 30, 20);
    directional.castShadow = true;
    directional.shadow.mapSize.width = 1024;
    directional.shadow.mapSize.height = 1024;
    directional.shadow.camera.near = 1;
    directional.shadow.camera.far = 100;
    directional.shadow.camera.left = -40;
    directional.shadow.camera.right = 40;
    directional.shadow.camera.top = 40;
    directional.shadow.camera.bottom = -40;
    this.scene.add(directional);

    // Hemisphere light for natural sky/ground color bleed
    const hemi = new THREE.HemisphereLight(
      COLORS.HEMISPHERE_SKY,
      COLORS.HEMISPHERE_GROUND,
      COLORS.HEMISPHERE_INTENSITY
    );
    this.scene.add(hemi);
  }

  buildFog() {
    this.scene.fog = new THREE.Fog(LEVEL.FOG_COLOR, LEVEL.FOG_NEAR, LEVEL.FOG_FAR);
  }

  buildSkyGradient() {
    // Large sky dome using a gradient material
    const skyGeo = new THREE.SphereGeometry(150, 16, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
  }

  buildDecor() {
    // Scatter some simple trees (cylinders + cones) around the edges
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const foliageGeo = new THREE.ConeGeometry(1.8, 4, 6);
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });

    const halfGround = LEVEL.GROUND_SIZE / 2;
    const treePositions = [
      [-25, -10], [-28, 5], [-22, -25], [-30, 15], [-26, 25],
      [25, -10], [28, 5], [22, -25], [30, 15], [26, 25],
      [-20, -35], [20, -35], [-15, 30], [15, 30],
    ];

    for (const [x, z] of treePositions) {
      if (Math.abs(x) > halfGround - 2 || Math.abs(z) > halfGround - 2) continue;

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, 1.5, z);
      trunk.castShadow = true;
      this.scene.add(trunk);

      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.set(x, 5, z);
      foliage.castShadow = true;
      this.scene.add(foliage);
    }
  }
}

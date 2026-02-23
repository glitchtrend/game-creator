// =============================================================================
// Enemy.js — Single enemy entity: spawn, march toward castle, reach castle
// Simple soldier/knight built from composed geometries (body box, head sphere).
// =============================================================================

import * as THREE from 'three';
import { ENEMY, CASTLE, LEVEL } from '../core/Constants.js';

export class Enemy {
  constructor(scene, x, speed) {
    this.scene = scene;
    this.alive = true;
    this.reachedCastle = false;
    this.speed = speed;

    this.group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(ENEMY.BODY_WIDTH, ENEMY.BODY_HEIGHT, ENEMY.BODY_DEPTH);
    const bodyMat = new THREE.MeshLambertMaterial({ color: ENEMY.BODY_COLOR });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = ENEMY.BODY_HEIGHT / 2;
    body.castShadow = true;
    this.group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(ENEMY.HEAD_RADIUS, 8, 6);
    const headMat = new THREE.MeshLambertMaterial({ color: ENEMY.HEAD_COLOR });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = ENEMY.HEAD_Y_OFFSET;
    head.castShadow = true;
    this.group.add(head);

    // Small shield on front
    const shieldGeo = new THREE.BoxGeometry(0.6, 0.8, 0.1);
    const shieldMat = new THREE.MeshLambertMaterial({ color: ENEMY.SHIELD_COLOR });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 0.7, ENEMY.BODY_DEPTH / 2 + 0.1);
    this.group.add(shield);

    // Position at spawn
    this.group.position.set(x, 0, ENEMY.SPAWN_Z);

    this.scene.add(this.group);
  }

  update(delta) {
    if (!this.alive) return;

    // March toward castle (positive Z direction)
    this.group.position.z += this.speed * delta;

    // Simple walking bob
    this.group.position.y = Math.abs(Math.sin(this.group.position.z * 2)) * 0.15;

    // Check if reached castle zone
    const castleZone = CASTLE.POSITION_Z - CASTLE.TOWER_SPREAD_Z - 1;
    if (this.group.position.z >= castleZone) {
      this.reachedCastle = true;
      this.alive = false;
    }
  }

  kill() {
    this.alive = false;
  }

  getPosition() {
    return this.group.position;
  }

  destroy() {
    this.scene.remove(this.group);
    this.group.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
  }
}

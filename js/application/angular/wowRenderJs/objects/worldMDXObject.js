import MDXObject from './MDXObject.js';
import config from './../../services/config.js'
import mathHelper from './../math/mathHelper.js';
import {mat4, vec4, vec3, glMatrix} from 'gl-matrix';

class WorldMDXObject extends MDXObject {
    constructor(sceneApi){
        super(sceneApi);
        this.diffuseColor = new Float32Array([1,1,1,1]);
        this.aabb = null;
    }
    calcDistance (position) {
        this.currentDistance = 0;
    }
    getIsInstancable() {
        return false;
    }
    getCurrentDistance(){
        return 0;
    }
    setIsRendered (value) {
        //if (value === undefined) return;

        this.isRendered = value;
    }
    getIsRendered () {
        return this.isRendered;
    }
    getDiameter () {
        return 100;
    }
    checkFrustumCullingAndSet (cameraVec4, frustumPlanes, num_planes) {
        if(this.aabb) {
            var inFrustum = this.checkFrustumCulling(cameraVec4, frustumPlanes, num_planes);
            this.setIsRendered(this.getIsRendered() && inFrustum);
        } else {
            this.setIsRendered(false);
        }
        //this.setIsRendered(true);
    }
    checkFrustumCulling (cameraVec4, frustumPlanes, num_planes) {
        var inFrustum = this.aabb && super.checkFrustumCulling(cameraVec4, frustumPlanes, this.aabb, num_planes);
        return inFrustum;
    }
    getDiffuseColor(){
        return new Float32Array([1,1,1,1]);
    }

    update (deltaTime, cameraPos) {
        //Only manual update from World Objects Manager
        /*
        if (!this.aabb) {
            var bb = super.getBoundingBox();
            if (bb) {
                var a_ab = vec4.fromValues(bb.ab.x,bb.ab.y,bb.ab.z,1);
                var a_cd = vec4.fromValues(bb.cd.x,bb.cd.y,bb.cd.z,1);

                var worldAABB = mathHelper.transformAABBWithMat4(this.placementMatrix, [a_ab, a_cd]);

                this.diameter = vec3.distance(worldAABB[0],worldAABB[1]);
                this.aabb = worldAABB;
            }
        }
        if (!this.getIsRendered()) return;
        super.update(deltaTime, cameraPos, this.placementInvertMatrix);
        */
    }
    objectUpdate (deltaTime, cameraPos) {
        if (!this.getIsRendered()) return;
        super.update(deltaTime, cameraPos, this.placementInvertMatrix);
    }
    createPlacementMatrix (pos, f, scale, rotationMatrix){
        var placementMatrix = mat4.create();
        mat4.identity(placementMatrix);

        mat4.translate(placementMatrix, placementMatrix, pos);

        if (rotationMatrix) {
            mat4.multiply(placementMatrix,placementMatrix, rotationMatrix);
        } else {
            mat4.rotateZ(placementMatrix, placementMatrix, f);
        }

        mat4.scale(placementMatrix, placementMatrix, [scale , scale , scale ]);

        var placementInvertMatrix = mat4.create();
        mat4.invert(placementInvertMatrix, placementMatrix);

        this.placementInvertMatrix = placementInvertMatrix;
        this.placementMatrix = placementMatrix;

        //update aabb
        var bb = super.getBoundingBox();
        if (bb) {
            var a_ab = vec4.fromValues(bb.ab.x,bb.ab.y,bb.ab.z,1);
            var a_cd = vec4.fromValues(bb.cd.x,bb.cd.y,bb.cd.z,1);

            var worldAABB = mathHelper.transformAABBWithMat4(this.placementMatrix, [a_ab, a_cd]);

            this.diameter = vec3.distance(worldAABB[0],worldAABB[1]);
            this.aabb = worldAABB;
        }
    }
    createPlacementMatrixFromParent (parentM2, attachment, scale){
        var parentM2File = parentM2.m2Geom.m2File;
        var attIndex = parentM2File.attachLookups[attachment];
        var attachInfo = parentM2File.attachments[attIndex];

        var boneId = attachInfo.bone;
        var parentBoneTransMat = parentM2.bones[boneId].tranformMat;

        var placementMatrix = mat4.create();
        mat4.identity(placementMatrix);
        mat4.multiply(placementMatrix,placementMatrix, parentM2.placementMatrix);

        mat4.multiply(placementMatrix, placementMatrix, parentBoneTransMat);
        mat4.translate(placementMatrix, placementMatrix, [
            attachInfo.pos.x,
            attachInfo.pos.y,
            attachInfo.pos.z,
            0
        ]);

        var placementInvertMatrix = mat4.create();
        mat4.invert(placementInvertMatrix, placementMatrix);

        this.placementInvertMatrix = placementInvertMatrix;
        this.placementMatrix = placementMatrix;

        var bb = super.getBoundingBox();
        if (bb) {
            var a_ab = vec4.fromValues(bb.ab.x,bb.ab.y,bb.ab.z,1);
            var a_cd = vec4.fromValues(bb.cd.x,bb.cd.y,bb.cd.z,1);

            var worldAABB = mathHelper.transformAABBWithMat4(this.placementMatrix, [a_ab, a_cd]);

            this.diameter = vec3.distance(worldAABB[0],worldAABB[1]);
            this.aabb = worldAABB;
        }
    }

    /* Draw functions */

    drawTransparentMeshes () {
        this.draw(true, this.placementMatrix, this.diffuseColor);
    }
    drawNonTransparentMeshes () {
        this.draw(false, this.placementMatrix, this.diffuseColor);
    }
    drawInstancedNonTransparentMeshes (instanceCount, placementVBO) {
        this.drawInstanced(false, instanceCount, placementVBO);
    }
    drawInstancedTransparentMeshes (instanceCount, placementVBO) {
        this.drawInstanced(true, instanceCount, placementVBO);
    }

}

export default WorldMDXObject;
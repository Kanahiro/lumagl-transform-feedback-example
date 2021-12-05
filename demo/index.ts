import { AnimationLoop, Model, Transform } from '@luma.gl/engine';
import { Buffer, clear, Texture2D } from '@luma.gl/webgl';

const numOfParticle = 100000;
const loop = new AnimationLoop({
    //@ts-ignore
    onInitialize({ gl }) {
        const sourcePositionBuffer = new Buffer(
            gl,
            new Float32Array(numOfParticle * 3).map(
                () => (Math.random() - 0.5) * 2,
            ),
        );

        const targetPositionBuffer = new Buffer(
            gl,
            new Float32Array(numOfParticle * 3).map(
                () => (Math.random() - 0.5) * 2,
            ),
        );

        const texture = new Texture2D(gl, {
            data: 'wind_data.png',
        });

        const model = new Model(gl, {
            vs: `
                attribute vec3 position;
                varying vec4 texValue;
                uniform sampler2D texture;

                void main() {
                    vec2 uv = vec2(position.x - 1.0, 1.0 - position.y) * 0.5;
                    texValue = texture2D(texture, uv);
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                    gl_PointSize = 2.0;
                }
            `,
            fs: `
                varying vec4 texValue;

                void main() {
                    float velocity = length(vec2(texValue.r, texValue.g) - vec2(0.49803922));
                    gl_FragColor = vec4(1.0, vec2(1.0 - velocity * 10.0), 1.0);
                }
            `,
            uniforms: {
                texture,
            },
            drawMode: gl.POINTS,
            vertexCount: numOfParticle,
        });

        const transform = new Transform(gl, {
            vs: `\
        in vec3 sourcePosition;
        out vec3 targetPosition;

        uniform sampler2D texture;
        uniform float time;
        
        mat2 rotation(float rad) {
            return mat2(
                cos(rad), sin(rad),
                -sin(rad), cos(rad)
            );
        }

        vec2 rand(vec2 co){
            vec2 rco = rotation(time) * co;
            return vec2(
                fract(sin(dot(rco.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(rco.yx ,vec2(8.64947,45.097))) * 43758.5453)
            )*2.0-1.0;
        }

        float randf(vec2 co){
            return fract(sin(dot(co.xy * rotation(time) ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
            vec2 uv = vec2(sourcePosition.x - 1.0, 1.0 - sourcePosition.y) * 0.5;
            vec4 texValue = texture2D(texture, uv);

            float age = floor(sourcePosition.z);

            float speedFactor = 0.05;
            vec2 distVec = (vec2(texValue.r, texValue.g) * 2.0 - vec2(1.0)) * speedFactor;

            if (
                (abs(sourcePosition.x) > 1.0 || abs(sourcePosition.y) > 1.0) ||
                (age > 10.0) || 
                (length(distVec) < 0.000001)
                ) {
                targetPosition = vec3(vec2(rand(sourcePosition.xy)), 0.0);
            } else {
                float noiseFactor = speedFactor * 0.01;
                vec2 noise = rand(sourcePosition.xy) * sin(time) * noiseFactor;
                targetPosition = vec3(sourcePosition.xy + distVec + noise, age + 1.05 * randf(sourcePosition.xy));
            }

        }
        `,
            sourceBuffers: {
                sourcePosition: sourcePositionBuffer,
            },
            feedbackBuffers: {
                targetPosition: targetPositionBuffer,
            },
            feedbackMap: {
                sourcePosition: 'targetPosition',
            },
            elementCount: numOfParticle,
        });

        return { model, transform, texture };
    },

    //@ts-ignore
    onRender({ gl, model, transform, texture }) {
        const time = performance.now();
        transform.run({
            uniforms: {
                texture,
                time,
            },
        });

        clear(gl, { color: [0, 0, 0, 1] });
        model
            .setUniforms({ time })
            .setAttributes({
                position: transform.getBuffer('targetPosition'),
            })
            .draw();

        transform.swap();
    },
});

loop.start({ canvas: 'canvas' });

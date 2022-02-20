let webcamTexture, video;
function initWebcamCapture() {
	video = document.createElement("video");
	video.autoplay = "";
	video.style = "display:none";
	video.id = "feedCam";

	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && video) {
		const constraints = {
			video: {
				width: 1280,
				height: 720,
				facingMode: "user"
			}
		};

		navigator.mediaDevices
			.getUserMedia(constraints)
			.then((stream) => {
				video.srcObject = stream;
				video.play();
			})
			.catch((error) => {
				console.error("Unable to access the camera/webcam.", error);
			});
	} else {
		console.error("MediaDevices interface not available.");
	}

	window.video = document.getElementById("video");

	webcamTexture = new THREE.VideoTexture(video);
	webcamTexture.minFilter = THREE.LinearFilter;
	webcamTexture.magFilter = THREE.LinearFilter;
	webcamTexture.needsUpdate = true;
}

let camera, scene, renderer, clock;
function setupMainScene() {
	const container = document.getElementById("shadercollab");
    const canvas =  document.getElementById("canvas");

	scene = new THREE.Scene();
	camera = new THREE.Camera();
	renderer = new THREE.WebGLRenderer({ canvas: canvas, preserveDrawingBuffer: true });

	const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;
	renderer.setPixelRatio(DPR);

	document.body.appendChild(renderer.domElement);
	container.appendChild(renderer.domElement);

	onWindowResize();
	window.addEventListener("resize", onWindowResize);

	clock = new THREE.Clock();
}

let copyScene, diffusionScene, ping, pong, alt;
function setupBufferScenes() {
	copyScene = new THREE.Scene();
	diffusionScene = new THREE.Scene();

	const renderTargetParams = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearMipMapLinearFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType
	};

	ping = new THREE.WebGLRenderTarget(
		window.innerWidth,
		window.innerHeight,
		renderTargetParams
	);
	pong = new THREE.WebGLRenderTarget(
		window.innerWidth,
		window.innerHeight,
		renderTargetParams
	);
	alt = new THREE.WebGLRenderTarget(
		window.innerWidth,
		window.innerHeight,
		renderTargetParams
	);
}

// Set up initial state
var rule =  [
    0,0,1,1,0,0,0,0,0,
    0,0,0,1,0,0,0,0,0
]

var dotCount = 0;
var bangCount =0;


let copyMaterial, diffusionMaterial;

window.copyMaterial = copyMaterial;
function initBufferScenes() {
	copyMaterial = new THREE.ShaderMaterial({
		uniforms: {
			channel0: {
				type: "t",
				value: pong.texture
			}
		},
		vertexShader: document.getElementById("vertex").innerHTML,
		fragmentShader: document.getElementById("copy").innerHTML
	});

	const copyObject = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), copyMaterial);
	copyScene.add(copyObject);

	diffusionMaterial = new THREE.ShaderMaterial({
		uniforms: {
			webcam: { type: "t", value: webcamTexture },
			backbuffer: { type: "t", value: pong },
			time: { type: "f", value: 0 },
			resolution: {
				type: "v2",
				value: new THREE.Vector2(window.innerWidth, window.innerHeight)
			},

             rule: { type: "iv",
                     value: rule },
            offset1: {value:0},
            offset2: {value: 0},
            offset3: {value: 0},
            offset4: {value: 0},
            modo1: {value: false}


		},
		vertexShader: document.getElementById("vertex").innerHTML,
		fragmentShader: document.getElementById("diffusion").innerHTML
	});

	const diffusionObject = new THREE.Mesh(
		new THREE.PlaneGeometry(2, 2),
		diffusionMaterial
	);
	diffusionScene.add(diffusionObject);
}

let quad;
function initMainScene() {
	const geom = new THREE.PlaneGeometry(2, 2);
	quad = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ map: ping }));
	scene.add(quad);
}

function onWindowResize() {
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function render_1() {
	diffusionMaterial.uniforms.time.value = clock.getElapsedTime();

	if (renderer.info.render.frame % 10 == 0) {
		for (let i = 0; i < 2; i++) {
			// Apply Diffusion shader and save output in ping
			renderer.setRenderTarget(ping);
			renderer.render(diffusionScene, camera);
			renderer.setRenderTarget(null);
			renderer.clear();

			// Swap ping and pong
			const temp = pong;
			pong = ping;
			ping = temp;

			// Update channels
			diffusionMaterial.uniforms.backbuffer.value = pong;
		}

		quad.material.map = ping;
	}

	// Render Main Scene
	renderer.render(scene, camera);
}


function animate() {
	 render_1();
	requestAnimationFrame(animate);
}

initWebcamCapture();
setupMainScene();
setupBufferScenes();
initBufferScenes();
initMainScene();
animate();

var controls = {
    char1: "!",
    char2: ".",
    char3: "-",
    char4: "_",
    modo1: false,
}

const pre = document.getElementById('pre')
function update(text) {
    const val = (text.split('').reduce((i,s)=>s.charCodeAt(0)+i,0))%9;
    const index = 2*val+1;
    const current = diffusionMaterial.uniforms.rule.value[index];

    diffusionMaterial.uniforms.rule.value[index] = !current;

    diffusionMaterial.uniforms.offset1.value = updateCharCount(text, controls.char1,100);
    diffusionMaterial.uniforms.offset2.value = updateCharCount(text, controls.char2,100);
    diffusionMaterial.uniforms.offset3.value = updateCharCount(text, controls.char3,10);

    diffusionMaterial.uniforms.offset4.value = updateCharCount(text, controls.char4,20);

}


function updateCharCount(txt,chr,v) {
    const count = (txt.split(chr) || []).length-1;
    return (count%v)/(v-1);

}


$(document).ready(function() {
    $(".editor").draggable().resizable();
});


function addGuiControls(){
   const datGui  = new dat.GUI({ autoPlace: true });

    var folder;
    var toggleModo1 = { modo1:function(){
        controls.modo1 = !controls.modo1;

        diffusionMaterial.uniforms.modo1.value = controls.modo1;
    }};

    folder = datGui.addFolder(`Controls`);
    folder.add(toggleModo1,'modo1').name("clean");
    //folder.add(toggleModo2,'mode 2');

    folder.add(controls, "char1").name("rule threshold").onFinishChange(function (value) {
        controls.char1 = value;
    });

    folder.add(controls, "char2").name("pixel size").onFinishChange(function (value) {
        controls.char2 = value;
    });

    folder.add(controls, "char3").name("saturation ").onFinishChange(function (value) {
        controls.char3 = value;
    });
    folder.add(controls, "char4").name("hue").onFinishChange(function (value) {
        controls.char4 = value;
    });


folder.open();

}

addGuiControls()

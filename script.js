const inputCanvas = document.getElementById('input');
const outputCanvas = document.getElementById('output');
const inputCtx = inputCanvas.getContext('2d');
const outputCtx = outputCanvas.getContext('2d');

inputCanvas.width   = 800;
inputCanvas.height  = 450;
outputCanvas.width  = inputCanvas.width;
outputCanvas.height = inputCanvas.height;
const image1 = new Image();
image1.crossOrigin = "Anonymous";
image1.src = 'image1.png';

// CARREGA A IMAGEM
image1.addEventListener("load", () => {
    inputCtx.drawImage(image1,0,0, inputCanvas.width, inputCanvas.height);
    // drawOutputImage(0)
    let i = 200
    setInterval(() => {
        drawOutputImage(100*Math.sin(i)+100)
        i+=0.1;
    }, 100)
});

// RENDERIZA A IMAGEM DE SAIDA
const drawOutputImage = (off) => {
    let scannedImage = inputCtx.getImageData(0,0,inputCanvas.width,inputCanvas.height);
    let scannedData = scannedImage.data;
    const scannedImageOriginal = inputCtx.getImageData(0,0,inputCanvas.width,inputCanvas.height);
    const scannedDataOriginal = scannedImageOriginal.data;
    const projections = []
    for(let i = 0; i < scannedData.length; i += 4){
        const sphereRadius = outputCanvas.height/2
        const pos = HELPER.getCoordinates(i, inputCanvas.width);
        // Paint inside circle
        if(HELPER.dist(pos.x, pos.y, outputCanvas.width/2, outputCanvas.height/2) < sphereRadius){

            // TRANSLADAMOS O SISTEMA PARA O CENTRO DA IMAGEM
            const translatedPos = {
                x: pos.x - outputCanvas.width/2,
                y: pos.y - outputCanvas.height/2
            }

            // CRIAMOS UM VETOR PARTINDO DA ORIGEM E INDO ATE O PIXEL CORRESPONDENTE DA IMAGEM DE ENTRADA
            const vector = HELPER.getInSphereVector(translatedPos.x, translatedPos.y, sphereRadius+10)
            const projectedVector = HELPER.getProjectedVector(vector, sphereRadius-off)

            // OBTEMOS O INDEX CORRESPONDENTE DO PIXEL NO ARRAY DE PIXELS DA IMAGEM DE ENTRADA
            const untranslatedVector = {
                x: Math.ceil(projectedVector.x) + inputCanvas.width/2,
                y: Math.ceil(projectedVector.y) + inputCanvas.height/2,
                z: Math.ceil(projectedVector.z)
            }

            projections.push(untranslatedVector)
            
            const projectedIndex = HELPER.getIndex(untranslatedVector.x, untranslatedVector.y, inputCanvas.width);
            
            // E ATRIBUIMOS AS CORES OBTIDAS
            scannedData[i+0] = scannedDataOriginal[projectedIndex+0]
            scannedData[i+1] = scannedDataOriginal[projectedIndex+1]
            scannedData[i+2] = scannedDataOriginal[projectedIndex+2] 
            scannedData[i+3] = 255;
        }else{
            //QUANDO NAO ESTAO DENTRO DO RAIO DA ESFERA EU ATRIBUO A COR PRETA
            scannedData[i+0] = 0;
            scannedData[i+1] = 0;
            scannedData[i+2] = 0;
            scannedData[i+3] = 255;
        }
   }
   //AQUI A IMAGEM É RENDERIZADA
   outputCtx.putImageData(scannedImage,0,0);
}

// FUNÇÕES AUXILIARES
const HELPER = {
    // PEGA AS COORDENADA DO PIXEL BASEADA EM SUA POSIÇÃO NO ARRAY
    getCoordinates: (pos, width) => {
        const x = (pos % (width*4))/4;
        const y = Math.floor(pos / (width*4));
        return {x, y};
    },
    // PEGA O INDICE DO PIXEL BASEADO EM SUAS COORDENADAS
    getIndex: (x, y, width) => {
        return (y * width + x) * 4;
    },
    dist: (xo, yo, xd, yd) => {
        return Math.sqrt(Math.pow(xo-xd, 2) + Math.pow(yo-yd, 2));
    },
    // TRANSLADA O VETOR DADO UM CERTO OFFSET
    translateOrigin: (vector, {offX, offY}) => {
        const x = vector.x - offX;
        const y = vector.y - offY;
        return {x, y, z: vector.z};
    },
    // NORMALIZA O VETOR 3D
    normalize: (vector) => {
        const length = Math.sqrt(vector.x*vector.x + vector.y*vector.y + vector.z*vector.z);
        return {
            x: vector.x/length,
            y: vector.y/length,
            z: vector.z/length
        }
    },
    // MULTIPLICA O "inSphereVector" POR UM NÚMERO (mult) PARA QUE ELE INTERCEPTE O PLANO Z=1 
    getProjectedVector: (vector, sphereRadius) => {
        const mult = sphereRadius/vector.z;
        return {
            x: vector.x*mult,
            y: vector.y*mult,
            z: vector.z*mult
        }
    },
    // RETORNA O VETOR 3D DE MAGNITUDE 1, QUE INTERSECTA A ESFERA, E QUE PARTE DO CENTRO DA ESFERA E PASSA NO MESMO X E Y QUE O PONTO DE INTERESSE
    getInSphereVector: (x, y, radius) => {
        const z = Math.sqrt(Math.abs(radius*radius - x*x - y*y))
        return {x, y, z};
    },
    // RETORNA A MAGNITUDE DO VETOR
    magnitude: (vector) => {
        return Math.sqrt(vector.x*vector.x + vector.y*vector.y + vector.z*vector.z);
    }
}
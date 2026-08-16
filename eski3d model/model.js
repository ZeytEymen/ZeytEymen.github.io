const container = document.getElementById('konva-container');
const stage = new Konva.Stage({
    container: 'konva-container',
    width: container.offsetWidth,
    height: container.offsetHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

//Boyutları buradan alacağız
const dimensions = {
    gerilim : 0,
    oluk_doluluk_orani : 0,
    tel_capi : 0,
    R : 0,
    R2: 0,
    R1: 0,
    r2: 0,
    r1: 0,
    tf: 0,
    go: 0,
    Ls: 0,
    ts: 0,
    copper_thickness : 0, 
    currentScale : 12,
    oluk_alani: 0, 
    bobin_alani: 0, 
    direnc: 0,
    akim: 0,
    sipir_sayi : 0,
    manyetik_moment : 0,
    guc : 0,
    akim_yogunluk : 0,
    mu_0 : 0,
    mu_r : 0,
    balata_surtunme_katsayi : 0,
    ah1 : 0,
    ah2 : 0,
    A1: 0,
    A3: 0,
    Ref : 0,
    L1 : 0,
    L2 : 0,
    kucuk_b_min : 0,
    kucuk_b_max : 0,
    kucuk_b_max_sat : 0,
    buyuk_b_min : 0,
    buyuk_b_max : 0,
    buyuk_b_max_sat : 0,
    r_Rh1 : 0,
    r_Rh2 : 0,
    r_R1 : 0,
    r_R2 : 0,
    r_R3 : 0,
    r_R4: 0,
    r_Rc: 0,
    kapali_reluktans:0,
    acik_reluktans:0,
    aki_min:0,
    aki_max:0,
    l_min:0,
    l_max:0,
    f1_max:0,
    f2_max : 0,
    f_toplam : 0,
    tork : 0,
}
// Sayfa yüklendiğinde input değerlerini dimensions nesnesine aktar
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        const value = parseFloat(input.value);
        dimensions[input.id] = value; // Varsayılan minimum değer
    });
    // İlk model ve hesaplama
    drawModel();
    calculateValues();
});

// Input event handlers
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (isNaN(value) || value <= 0) {
             dimensions[e.target.id] = 0;
        } else {
            dimensions[e.target.id] = value;
        }
        if (e.target.id === 'R1') {
            if (value <= dimensions.r2) {
                dimensions[e.target.id] = dimensions.r2 + 1; // r2'den büyük bir varsayılan değer
            } else {
                dimensions[e.target.id] = value;
            }
        } else {
            dimensions[e.target.id] = value;
        }
        if(e.target.id === 'R')
        {
            document.getElementById('R2').value = value / 2;
            dimensions.R2 = value / 2;
        }
        if(e.target.id === 'R2')
        {
            document.getElementById('R').value = value * 2;
        }
    
        drawModel();
        calculateValues();
        
    });
});

function calculateValues()
{
    dimensions.oluk_alani = (dimensions.R1 - dimensions.r2) * (dimensions.Ls - dimensions.ts);
    dimensions.bobin_alani = dimensions.oluk_alani * dimensions.oluk_doluluk_orani;
    dimensions.sipir_sayi = Math.floor(dimensions.bobin_alani / (3.1415 * Math.pow(dimensions.tel_capi, 2) / 4));
    dimensions.Ref = (2 / 3) * ((Math.pow(dimensions.R1, 3) - Math.pow(dimensions.r2, 3)) / (Math.pow(dimensions.R1, 2) - Math.pow(dimensions.r2, 2)));
    dimensions.direnc = 1.69 * 0.00000001 * 2 * 3.1415 * (dimensions.Ref * 0.001) / ((3.1415 * Math.pow(dimensions.tel_capi * 0.001, 2)) / 4) * dimensions.sipir_sayi;
    dimensions.akim = dimensions.gerilim / dimensions.direnc;
    dimensions.manyetik_moment = dimensions.akim * dimensions.sipir_sayi;
    dimensions.guc = Math.pow(dimensions.gerilim, 2) / dimensions.direnc;
    dimensions.akim_yogunluk = dimensions.akim / (3.1415 * Math.pow(dimensions.tel_capi, 2) / 4);
    dimensions.mu_0 = 4 * 3.1415 * 0.0000001;
    dimensions.ah1 = 3.1415 * (Math.pow(dimensions.r2, 2) - Math.pow(dimensions.r1, 2));
    dimensions.ah2 = 3.1415 * (Math.pow(dimensions.R2, 2) - Math.pow(dimensions.R1, 2));
    dimensions.A1 = 2 * 3.1415 * dimensions.Ref * dimensions.tf;
    dimensions.A3 = 2 * 3.1415 * dimensions.Ref * dimensions.ts;
    dimensions.L1 = (dimensions.R1 - dimensions.r2) + (dimensions.R2 - dimensions.R1) / 2 + (dimensions.r2 - dimensions.r1) / 2;
    dimensions.L2 = dimensions.Ls - dimensions.ts / 2;
    dimensions.r_Rh1 = Math.round(dimensions.go * 0.001 / (dimensions.mu_0 * dimensions.ah1 * 0.000001));
    dimensions.r_Rh2 = Math.round(dimensions.go * 0.001 / (dimensions.mu_0 * dimensions.ah2 * 0.000001));
    dimensions.r_R1 = dimensions.L1 * 0.001 / (dimensions.mu_r * dimensions.mu_0 * dimensions.A1 * 0.000001);
    dimensions.r_R2 = dimensions.L2 * 0.001 / (dimensions.mu_r * dimensions.mu_0 * dimensions.ah2 * 0.000001);
    dimensions.r_R3 = dimensions.L1 * 0.001 / (dimensions.mu_r * dimensions.mu_0 * dimensions.A3 * 0.000001);
    dimensions.r_R4 = dimensions.L2 * 0.001 / (dimensions.mu_r * dimensions.mu_0 * dimensions.ah1 * 0.000001);
    dimensions.r_Rc = dimensions.copper_thickness * 0.001 / (dimensions.mu_0 * dimensions.ah1 * 0.000001);
    dimensions.acik_reluktans = dimensions.r_Rh1 + dimensions.r_Rh2 + dimensions.r_R1 + dimensions.r_R2 +dimensions.r_R3 + dimensions.r_R4 +dimensions.r_Rc;
    dimensions.kapali_reluktans = dimensions.r_R1 + dimensions.r_R2 + dimensions.r_R3 +dimensions.r_R4 +dimensions.r_Rc;
    dimensions.aki_min = dimensions.sipir_sayi * dimensions.akim / dimensions.acik_reluktans;
    dimensions.aki_max = dimensions.sipir_sayi * dimensions.akim / dimensions.kapali_reluktans;
    dimensions.kucuk_b_min = dimensions.aki_min / (dimensions.ah1 * 0.000001);
    dimensions.kucuk_b_max = dimensions.aki_max / (dimensions.ah1 * 0.000001);
    dimensions.kucuk_b_max_sat = dimensions.kucuk_b_max > 1.7 ? 1.7 : dimensions.kucuk_b_max;
    dimensions.buyuk_b_min = dimensions.aki_min / (dimensions.ah2 * 0.000001);
    dimensions.buyuk_b_max = dimensions.aki_max / (dimensions.ah2 * 0.000001);
    dimensions.buyuk_b_max_sat = dimensions.buyuk_b_max > 1.7 ? 1.7 : dimensions.buyuk_b_max;
    dimensions.l_min = Math.pow(dimensions.sipir_sayi, 2) / dimensions.acik_reluktans;
    dimensions.l_max = Math.pow(dimensions.sipir_sayi, 2) / dimensions.kapali_reluktans;
    dimensions.f1_max = Math.pow(dimensions.kucuk_b_max_sat, 2) * dimensions.ah1 * 0.000001 / (2 * dimensions.mu_0);
    dimensions.f2_max = Math.pow(dimensions.buyuk_b_max_sat, 2) * dimensions.ah2 * 0.000001 / (2 * dimensions.mu_0);
    dimensions.f_toplam = dimensions.f1_max + dimensions.f2_max;
    dimensions.tork = dimensions.f_toplam * dimensions.Ref * 0.001 * dimensions.balata_surtunme_katsayi;
    console.log('f_toplam',dimensions.f_toplam);
    console.log('ref',dimensions.ref);
    console.log('balata_surtunme_katsayi',dimensions.balata_surtunme_katsayi);







    document.getElementById('oluk_alani').textContent      = dimensions.oluk_alani;
    document.getElementById('bobin_alani').textContent     = dimensions.bobin_alani;
    document.getElementById('sipir_sayi').textContent      = dimensions.sipir_sayi;
    document.getElementById('Ref').textContent             = dimensions.Ref;
    document.getElementById('direnc').textContent          = dimensions.direnc;
    document.getElementById('akim').textContent            = dimensions.akim;
    document.getElementById('manyetik_moment').textContent = dimensions.manyetik_moment;
    document.getElementById('guc').textContent             = dimensions.guc;
    document.getElementById('akim_yogunluk').textContent   = dimensions.akim_yogunluk;
    document.getElementById('mu_0').textContent            = dimensions.mu_0;
    document.getElementById('ah1').textContent             = dimensions.ah1;
    document.getElementById('ah2').textContent             = dimensions.ah2;
    document.getElementById('A1').textContent              = dimensions.A1;
    document.getElementById('A3').textContent              = dimensions.A3;
    document.getElementById('L1').textContent              = dimensions.L1;
    document.getElementById('L2').textContent              = dimensions.L2;
    document.getElementById('kucuk_b_min').textContent     = dimensions.kucuk_b_min;
    document.getElementById('kucuk_b_max').textContent     = dimensions.kucuk_b_max;
    document.getElementById('kucuk_b_max_sat').textContent = dimensions.kucuk_b_max_sat;
    document.getElementById('buyuk_b_min').textContent     = dimensions.buyuk_b_min;
    document.getElementById('buyuk_b_max').textContent     = dimensions.buyuk_b_max;
    document.getElementById('buyuk_b_max_sat').textContent = dimensions.buyuk_b_max_sat;
    document.getElementById('r_Rh1').textContent           = dimensions.r_Rh1;
    document.getElementById('r_Rh2').textContent           = dimensions.r_Rh2;
    document.getElementById('r_R1').textContent           = dimensions.r_R1;
    document.getElementById('r_R2').textContent           = dimensions.r_R2;
    document.getElementById('r_R3').textContent           = dimensions.r_R3;
    document.getElementById('r_R4').textContent           = dimensions.r_R4;
    document.getElementById('r_Rc').textContent           = dimensions.r_Rc;
    document.getElementById('kapali_reluktans').textContent= dimensions.kapali_reluktans;
    document.getElementById('acik_reluktans').textContent  = dimensions.acik_reluktans;
    document.getElementById('aki_min').textContent         = dimensions.aki_min;
    document.getElementById('aki_max').textContent         = dimensions.aki_max;
    document.getElementById('l_min').textContent           = dimensions.l_min;
    document.getElementById('l_max').textContent           = dimensions.l_max;
    document.getElementById('f1_max').textContent          = dimensions.f1_max;
    document.getElementById('f2_max').textContent          = dimensions.f2_max;
    document.getElementById('f_toplam').textContent        = dimensions.f_toplam;
    document.getElementById('tork').textContent            = dimensions.tork;
}




//document.getElementById('inputForm').addEventListener('submit', function (e) { e.preventDefault(); drawModel();});
document.addEventListener('DOMContentLoaded', function () {drawModel()});
 // mm'den piksel'e dönüşüm
 function mmToPx(mm) {
    return mm * dimensions.currentScale;
}

function drawModel() {
    //Bir önceki çizim silinecek
    layer.destroyChildren();

     // Merkez noktası
    const centerX = stage.width() / 2.8;
    const centerY = stage.height() / 2;

    //Dış Gövde
    const outerBody = new Konva.Rect({
        x : centerX - mmToPx(dimensions.R2 - dimensions.r1) / 2,
        y : centerY - mmToPx(dimensions.Ls) / 2,
        width: mmToPx(dimensions.R2 - dimensions.r1),
        height: mmToPx(dimensions.Ls),
        fill: '#BBBBBB',
    });
    

    //İç Boşluk
    const innerSpace = new Konva.Rect({
        x : centerX - mmToPx(dimensions.R1 - dimensions.r2) / 2,
        y : centerY - mmToPx(dimensions.Ls) / 2,
        width : mmToPx(dimensions.R1 - dimensions.r2),
        height : mmToPx(dimensions.Ls - dimensions.ts),
        fill : 'white'
    });
    
    //Ek Bakır
    const copper = new Konva.Rect({
        //x : centerX - mmToPx(dimensions.R2 - dimensions.r1) / 2,
        x : innerSpace.x() + innerSpace.width() - 2,
        y : innerSpace.y()+innerSpace.height() - mmToPx(dimensions.copper_thickness),
        width: mmToPx(dimensions.r2 - dimensions.r1),
        height: mmToPx(dimensions.copper_thickness),
        fill: '#fabe0a',
        stroke: 'black',
        strokeWidth: 2,
    });

    // Bobin
    const coil = new Konva.Rect({
        x : centerX - (mmToPx(dimensions.R1 - dimensions.r2) - mmToPx(1)) / 2,
        y : centerY - (mmToPx(dimensions.Ls) - mmToPx(1)) / 2,
        width : mmToPx(dimensions.R1 - dimensions.r2) - mmToPx(1),
        height : mmToPx(dimensions.Ls - dimensions.ts) - mmToPx(1),
        fill: '#ff7f27',
        stroke: 'black',
        strokeWidth: 5,
    });

    // Kapak
    const coverPlate = new Konva.Rect({
        x : centerX - mmToPx(dimensions.R2 - dimensions.r1) / 2,
        y : outerBody.y() - mmToPx(dimensions.tf) - mmToPx(dimensions.go),
        width: mmToPx(dimensions.R2 - dimensions.r1),
        height: mmToPx(dimensions.tf),
        fill: '#BBBBBB' 
    });

    const lines = [
         ////coiln,I
         {
            isText : true, 
            width : coil.width(),
            text: 'N,I',
            textX: coil.x(),
            textY: (coil.y() + (coil.height() / 2)) - (dimensions.currentScale / 2),
            textColor : 'black',
        },
        ////LS
        {
            points: [
                outerBody.x() - 10,
                centerY + mmToPx(dimensions.Ls) / 2,
                outerBody.x() - 10,
                centerY - mmToPx(dimensions.Ls) / 2,
            ],
            isArrow : true, 
            arrowColor : 'red',
        },
        ////LS 2
        {
            points: [
                outerBody.x() - 10,
                centerY - mmToPx(dimensions.Ls) / 2,
                outerBody.x() - 10,
                centerY + mmToPx(dimensions.Ls) / 2,
            ],
            isArrow : true, 
            arrowColor : 'red',
        },
        ////LS TEXT
        {
            isText : true,
            width : 70,
            text: 'Ls : ' + dimensions.Ls + ' mm \n',
            textX:outerBody.x() - 85,
            textY: (centerY - mmToPx(dimensions.Ls) / 2) + 10,
            textColor : 'red',
        },
        //// TS
        {
            points: [
                outerBody.x() - 30,
                centerY + mmToPx(dimensions.Ls) / 2,
                outerBody.x() - 30,
                innerSpace.y() + innerSpace.height(),
            ],
            isArrow : true, 
            arrowColor : 'blue'
        },
        ////TS 2
        {
            points: [
                outerBody.x() - 30,
                innerSpace.y() + innerSpace.height(),
                outerBody.x() - 30,
                centerY + mmToPx(dimensions.Ls) / 2,
            ],
            isArrow : true, 
            arrowColor : 'blue',
        },
        ////TS TEXT
        {
            isText : true,
            width : 60,
            text: 'Ts : ' + dimensions.ts + ' mm \n',
            textX: outerBody.x() - 98,
            textY: innerSpace.y() + innerSpace.height() + 10,
            textColor : 'blue',
        },
        ////tf 1
        {
            points: [
                coverPlate.x() - 20,
                coverPlate.y(),
                coverPlate.x() - 20,
                coverPlate.y() + coverPlate.height() - 2,

            ],
            isArrow : true, 
            arrowColor : 'green',
        },
        ////tf 2
        {
            points: [
                coverPlate.x() - 20,
                coverPlate.y() + coverPlate.height() - 2,
                coverPlate.x() - 20,
                coverPlate.y(),

            ],
            isArrow : true, 
            arrowColor : 'green',
        },
        {
            isText : true,
            width : 70,
            text: 'tf : ' + dimensions.tf + ' mm \n',
            textX: coverPlate.x() - 93,
            textY: coverPlate.y() + 10,
            textColor : 'green',            
        },
        ////go top 
        {
            points: [
                coverPlate.x() - 140,
                coverPlate.y() + (coverPlate.height() / 2),
                coverPlate.x() - 140,
                coverPlate.y() + coverPlate.height() - 2,

            ],
            isArrow : true, 
            arrowColor : 'orange',
        },
        ////go bottom 
        {
            points: [
                coverPlate.x() - 140,
                outerBody.y() + (coverPlate.height() / 2),
                coverPlate.x() - 140,
                outerBody.y(),

            ],
            isArrow : true, 
            arrowColor : 'orange',
        },
        
        ////go text 
        {
            isText : true, 
            text: 'go',
            width : 20,
            textX: coverPlate.x() - 168,
            textY: coverPlate.y() + coverPlate.height() - 2,
            textColor : 'orange',
        },
        ////R2 arrow 
        {
            points: [
                (coverPlate.x() + coverPlate.width()) + 50,
                coverPlate.y() - 80,
                coverPlate.x() + 2,
                coverPlate.y() - 80,
            ],
            isArrow : true,
            arrowColor : 'chocolate'
        },
        /////R2 arrow text
        {
            isText : true, 
            text: 'R2',
            width : 20,
            textX: coverPlate.x() - 20,
            textY: coverPlate.y() - 88,
            textColor : 'chocolate',
        },
        ////R1 arrow 
        {
            points: [
                (coverPlate.x() + coverPlate.width()) + 50,
                coverPlate.y() - 60,
                innerSpace.x() + 2,
                coverPlate.y() - 60,
            ],
            isArrow : true,
            arrowColor : 'goldenrod'
        },
        {
            isText : true,
            text: 'R1',
            width : 20,
            textX: innerSpace.x() - 20,
            textY: coverPlate.y() - 68,
            textColor : 'goldenrod',
        },
        ////r2 arrow 
        {
            points: [
                (coverPlate.x() + coverPlate.width()) + 50,
                coverPlate.y() - 40,
                innerSpace.x() + innerSpace.width() + 2,
                coverPlate.y() - 40,

            ],
            isArrow : true,
            arrowColor : 'purple'
        },
        ////r2 arrow text
        {
            isText : true,
            text: 'r2',
            width : 20,
            textX: innerSpace.x() + innerSpace.width() - 20,
            textY: coverPlate.y() - 48,
            textColor : 'purple',
        },
        ////r1 arrow 
        {
            points: [
                (coverPlate.x() + coverPlate.width()) + 50,
                coverPlate.y() - 20,
                coverPlate.x() + coverPlate.width(),
                coverPlate.y() - 20,
            ],
            isArrow : true,
            arrowColor : 'red'
        },
        ////r1 arrow text
        {
            isText : true,
            width : 20,
            text: 'r1',
            textX: (coverPlate.x() + coverPlate.width()) - 20,
            textY: coverPlate.y() - 25,
            textColor : 'red',
        },
        // //outer body top limit
        {
            points: [
                outerBody.x() + 1,
                outerBody.y(),
                outerBody.x() - 150,
                outerBody.y(),
            ],
            isLimit : true,
            lineColor : 'black'
        },
        //outer body bottom limit
        {
            points: [
                outerBody.x() + 1,
                centerY + mmToPx(dimensions.Ls) / 2,
                outerBody.x() - 70,
                centerY + mmToPx(dimensions.Ls) / 2,
            ],
            isLimit : true,
            lineColor : 'black'
        },
        // //inner space bottom limit
        {
            points: [
                innerSpace.x() + 1,
                innerSpace.y() + innerSpace.height(),
                outerBody.x() - 70,
                innerSpace.y() + innerSpace.height()
            ],
            isLimit : true,
            lineColor : 'black'
        },
        ////plate top limit
        {
            points: [
                coverPlate.x() + 1,
                coverPlate.y() + 1,
                coverPlate.x() - 70,
                coverPlate.y() + 1,
            ],
            isLimit : true,
            lineColor : 'black'
        },
        ////plate bottom limit
        {
            points: [
                coverPlate.x() + 1,
                coverPlate.height() + coverPlate.y() - 2,
                coverPlate.x() - 150,
                coverPlate.height() + coverPlate.y() - 2,
            ],
            isLimit : true,
            lineColor : 'black'
        },
        ////plate left limit 1
        {
            points: [
                coverPlate.x() + 1,
                coverPlate.y() + 1,
                coverPlate.x() + 1,
                coverPlate.y() - 80,
            ],
            isLimit : true,
            lineColor : 'black'
        },
        ////plate left limit 2
        {
            points: [
                innerSpace.x() - 1,
                innerSpace.y() + 1,
                innerSpace.x() - 1,
                coverPlate.y() - 80,
            ],
            isLimit : true,
            lineColor : 'black'
        },
        ////plate right limit 1
        {
            points: [
                coverPlate.x() + coverPlate.width() - 1,
                coverPlate.y() + 1,
                coverPlate.x() + coverPlate.width() - 1,
                coverPlate.y() - 80,
            ],
            isLimit : true,
            lineColor : 'black'
        },
        ////plate right limit 2
        {
            points: [
                innerSpace.x() + innerSpace.width() - 1,
                innerSpace.y() + 1,
                innerSpace.x() + innerSpace.width() - 1,
                coverPlate.y() - 80,
            ],
            isLimit : true,
            lineColor : 'black'
        },
    ];

    const originalGroup = new Konva.Group({});

   
    lines.forEach(line => {

        if(line.isLimit)
        {
            originalGroup.add(new Konva.Line({
                points: line.points,
                stroke: line.lineColor,
                strokeWidth: 1,
                dash: [4, 2]}));
        }
        if(line.isArrow)
        {
            originalGroup.add(new Konva.Arrow({
            points: line.points,
            stroke: line.arrowColor,
            strokeWidth: 1,
            pointerLength: 10,
            pointerWidth: 10,
            fill: line.arrowColor}));
        }
        if(line.isText){
            var text = new Konva.Text({
                x: line.textX,
                y: line.textY,
                text: line.text,
                fill: line.textColor,
                fontFamily: 'Calibri',
                fontSize: 14,
                align : 'center',
                width : line.width,
            });
            const textBackground = new Konva.Rect({
                x: line.textX,
                y: line.textY,
                width: line.width,
                height: 20, 
                fill: 'yellow',
                cornerRadius: 4, 
            });
            originalGroup.add(textBackground);
            originalGroup.add(text);
        }
  
    });
    
    originalGroup.add(outerBody,innerSpace,coil,coverPlate,copper);
    originalGroup.find('Text').forEach((textNode) => {
        textNode.moveToTop();
    });
    originalGroup.find('Line').forEach((textNode) => {
        textNode.moveToTop();
    });

    
    
    bound = originalGroup.getClientRect();
    borderOrg = new Konva.Rect({
        x: bound.x,
        y: bound.y,
        width : bound.width,
        height : bound.height,
        stroke : 'black',
        strokeWidth : 2,
        dash : [4,4]
    });


    const centerLine = new Konva.Line({
    points: [
        borderOrg.x() + borderOrg.width(),
        borderOrg.y() + 8,
        borderOrg.x() + borderOrg.width(),
        borderOrg.y() + borderOrg.height() - 3,
    ],
    stroke : 'black',
    strokeWidth : 3,
    dash : [2,4],
    });


    const mirrored = originalGroup.clone();
    mirrored.x((borderOrg.x() + borderOrg.width())* 2)
    mirrored.scaleX(-1);
    mirrored.find('Text').forEach((textNode) => {
        textNode.offsetX(textNode.width());
        textNode.scaleX(-1);
    });

    layer.add(originalGroup,mirrored);
    layer.add(centerLine);

    layer.batchDraw();
    
};

stage.on('wheel', (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = stage.scaleX();

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stage.scale({ x: newScale, y: newScale });

    const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
});


    // NESNELERİN ETRAFINA BORDER ATAR
    // originalGroup.getChildren().forEach((child) => {
    //     console.log(child);
    //     const rect = child.getClientRect();
    //     const debugRect = new Konva.Rect({
    //         x: rect.x,
    //         y: rect.y,
    //         width: rect.width,
    //         height: rect.height,
    //         stroke: 'blue',
    //         strokeWidth: 1,
    //         dash: [2, 2]
    //     });
    //   //  layer.add(debugRect);
    //   //  debugRect.moveToTop();
    // });
    
       // layer.add(originalGroup);


    // layer.add(outerBody);
    // layer.add(innerSpace);
    // layer.add(coil);
    // layer.add(coverPlate);
    // layer.add(copper);
   

    // mirrored.find('Text').forEach((textNode) => {
    //     console.log('Original X:', textNode.x());
    //     console.log('Offset X:', textNode.offsetX());
    //     console.log('Width:', textNode.width());
    // });
    
    

    //NESNELERİN ETRAFINA BODER ATAR
    // mirrored.getChildren().forEach((child) => {
    //     console.log(child);
    //     const rect = child.getClientRect();
    //     const debugRect = new Konva.Rect({
    //         x: rect.x,
    //         y: rect.y,
    //         width: rect.width,
    //         height: rect.height,
    //         stroke: 'blue',
    //         strokeWidth: 1,
    //         dash: [2, 2]
    //     });
    //    // layer.add(debugRect);
    // });
    
    // bound2 = mirrored.getClientRect();
    // borderOrg2 = new Konva.Rect({
    //     x: bound2.x,
    //     y: bound2.y,
    //     width : bound2.width,
    //     height : bound2.height,
    //     stroke : 'black',
    //     strokeWidth : 2,
    //     dash : [4,4]
    // });
    //layer.add(borderOrg2);

//     console.log('ORIGINAL GROUP',originalGroup.getClientRect());
//     console.log('MİRRORED GROUP',mirrored.getClientRect());
//    // console.log('ORIGINAL bound',bound);
//  //   console.log('MİRRORED bound',bound2);

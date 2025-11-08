ClearScreen= () =>{
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,Width,Height);
    ctx.closePath();
};

ConvertAngle = (Angle) => {
return Angle / 180 * Math.PI;
}

DrawArc = (posX,posY,Rad,StartAng,EndAng,clockWise,pattern = []) =>{
    ctx.beginPath();
    ctx.setLineDash(pattern);
    ctx.strokeStyle = "red";
    ctx.fillStyle = "rgba(255,0,0,0.5)";
    StartAng %= 360;
    EndAng %= 360;
    if(StartAng <= EndAng)
        ctx.arc(posX,posY,Rad,ConvertAngle(StartAng),ConvertAngle(EndAng),clockWise);
    else
        ctx.arc(posX,posY,Rad,ConvertAngle(EndAng),ConvertAngle(StartAng),!clockWise);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.closePath();
}

//This function is for the result angle from the atan2 function
ConvertAngleToRightRange = (angle) => {
    if(angle < 0)
        angle *= (-1);
    else
        angle = 180 + (180 - angle);

    return angle;
}

GenerateTableContent = (SegmentData) => {
    let td = document.createElement("td");
    let div = document.createElement("div");
    div.classList.add("container");
    td.append(div);
    console.log(td);
}
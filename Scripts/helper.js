ClearScreen= () =>{
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,Width,Height);
    ctx.closePath();
};

ConvertAngle = (Angle) => {
return Angle / 180 * Math.PI;
}

DrawArc = (posX,posY,Rad,StartAng,EndAng,clockWise) =>{
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.fillStyle = "rgba(255,0,0,0.5)" ;
    StartAng %= 360;
    EndAng %= 360;
    if(StartAng <= EndAng)
        ctx.arc(posX,posY,Rad,ConvertAngle(StartAng),ConvertAngle(EndAng),clockWise);
    else
        ctx.arc(posX,posY,Rad,ConvertAngle(EndAng),ConvertAngle(StartAng),!clockWise);
    ctx.stroke();
    ctx.closePath();
}
KeepAngleInWorkingRange= (angle) =>{
    angle %= 360;

    if(angle <= 0)
        return (angle * (-1));
    else
        return (angle + 180);
}
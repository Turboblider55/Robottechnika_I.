let canvas = document.querySelector('canvas');

    const Width = window.innerWidth;
    const Height = window.innerHeight;

    canvas.width = Width * 0.95;
    canvas.height = Height * 0.95;

    let ctx = canvas.getContext('2d');

    Origin_x = Width / 2 ;
    Origin_y = Height / 2 ;

    //Konstansok
    const First_Length = 1.2;
    const First_Min_Angle = 25;
    const First_Max_Angle = 90;
    const Second_Length = 0.9;
    const Second_Min_Angle = 45;
    const Second_Max_Angle = 135;

    First_Angle = First_Min_Angle;
    Second_Angle = Second_Min_Angle;
    




    let CS = new Coordinate_System(Width / 2,Height / 2,0);
    CS.DrawCS();
    
    let Segment1 = new Robot_Segment(CS,First_Length, First_Min_Angle, First_Min_Angle,First_Max_Angle);
    let Segment2 = new Robot_Segment(CS,Second_Length, Second_Min_Angle, Second_Min_Angle,Second_Max_Angle);
    //let Segment3 = new Robot_Segment(CS,Second_Length, Second_Min_Angle, Second_Min_Angle,Second_Max_Angle);
    
    Segment1.SetNextSegment(Segment2);
    Segment2.SetPrevSegment(Segment1);
    
    // Segment2.SetNextSegment(Segment3);
    // Segment3.SetPrevSegment(Segment2);

    Segment1.CS.DrawCS();
    Segment1.CS.DrawCSWithDivision(4);
    Segment1.Draw();
    
    Segment2.CS.DrawCS();
    Segment2.CS.DrawCSWithDivision(2);
    Segment2.Draw();

    // Segment3.CS.DrawCS();
    // Segment3.CS.DrawCSWithDivision(2);
    // Segment3.Draw();

    Arm = new Robot_Arm(CS);
    Arm.Segments[0] = Segment1;
    Arm.Segments[1] = Segment2;
    //Arm.Segments[2] = Segment3;
    Arm.DrawWorkingArea(0);
    //Arm.DrawAreaEnds();

    addEventListener("wheel",e=>{
        if(e.deltaY < 0){
            
            for(let i = 0; i < Arm.Segments.length; i++){
                Arm.Segments[i].RotateAroundOrigin((Arm.Segments[i].Max_Angle - Arm.Segments[i].Min_Angle) / 10);
            }

            //console.log(Segment1.Angle)
        }
        else if(e.deltaY > 0){
            
            for(let i = 0; i < Arm.Segments.length; i++){
                Arm.Segments[i].RotateAroundOrigin(-(Arm.Segments[i].Max_Angle - Arm.Segments[i].Min_Angle) / 10);
            }
        }
        
        ClearScreen();

        Segment1.CS.DrawCS();
        Segment1.Draw();
        Segment1.CS.DrawCSWithDivision(4);
        
        Segment2.CS.DrawCS();
        Segment2.Draw();
        Segment2.CS.DrawCSWithDivision(2);
        
        // Segment3.CS.DrawCS();
        // Segment3.Draw();
        // Segment3.CS.DrawCSWithDivision(2);

        Arm.DrawWorkingArea(0);
        //Arm.DrawAreaEnds();

        let StartAng = 0;
        let EndAng = -90;
        let Rad = 20;
        let CircCx = 100;
        let CircCy = 100;

        DrawArc(CircCx,CircCy,Rad,StartAng,EndAng,true);
        
        let StartP = [0,0];
        let EndP = [100,100];

        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(StartP[0],StartP[1]);
        ctx.lineTo(EndP[0],EndP[1]);
        ctx.stroke();
        ctx.closePath();

        //(SEx² + SEy²) t² + 2 (SEx.CSx + SEy.CSy) t + CSx² + CSy² - R² = 0
        //discr = (2 (SEx.CSx + SEy.CSy))² - 4 * (SEx² + SEy²) * (CSx² + CSy² - R²)
        // t1,2 = (-(2 (SEx.CSx + SEy.CSy)) +- Sqrt(discr) ) / 2 * (SEx² + SEy²)

        let SE = [EndP[0] - StartP[0],EndP[1] - StartP[1]];
        let CS = [StartP[0] - CircCx, StartP[1] - CircCy];

        let discr = (2 * (SE[0] * CS[0] + SE[1]*CS[1]))**2 - 4 * (SE[0]**2 + SE[1]**2) * (CS[0]**2 + CS[1]**2 - Rad**2);
        //console.log(discr);
        if(discr < 0){
            console.log('Nincs megoldás')
        }
        discr = Math.sqrt(discr);
        let t1 = (-(2 * (SE[0] * CS[0] + SE[1]*CS[1])) + discr) / (2 * (SE[0]**2 + SE[1]**2));
        let t2 = (-(2 * (SE[0] * CS[0] + SE[1]*CS[1])) - discr) / (2 * (SE[0]**2 + SE[1]**2));
        
        console.log(t1,t2)

        // StartAng = KeepAngleInWorkingRange(StartAng);
        // EndAng = KeepAngleInWorkingRange(EndAng);



        if(t1 > 0 && t1 < 1){
            let X1 = StartP[0] + t1 * SE[0];
            let Y1 = StartP[1] + t1 * SE[1];

            let Ang1 = Math.atan2(Y1 - CircCy, X1 - CircCx);

            Ang1 = (Ang1  / Math.PI * 180 );
                
            Ang1 = KeepAngleInWorkingRange(Ang1);

            console.log(Ang1, StartAng,EndAng);

            if(Ang1  > StartAng  && Ang1  < EndAng ){
                
                console.log("The Line intersects the circle arc");
            }
            else{
                console.log("The Line doesn't intersects the circle arc");
            }        
        }
        if(t2 > 0 && t2 < 1){

            let X2 = StartP[0] + t2 * SE[0];
            let Y2 = StartP[1] + t2 * SE[1];
    
            let Ang2 = Math.atan2(Y2 - CircCy, X2 - CircCx);
            Ang2 = (Ang2  / Math.PI * 180 );

            Ang2 = KeepAngleInWorkingRange(Ang2);

            console.log(Ang2, StartAng,EndAng);

            if(Ang2 > StartAng  && Ang2 < EndAng){
                
                console.log("The Line intersects the circle arc");
            }
            else{
                console.log("The Line doesn't intersects the circle arc");
            }   

        }

    });
    addEventListener("mousedown",(e)=>{
        //ClearScreen
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.moveTo(0,0);
        ctx.lineTo(e.clientX,e.clientY);
        ctx.stroke();
        ctx.closePath();
        Arm.CheckIfPointIsInSideWorkingArea(0,null,null,e.clientX,e.clientY);
    });





    


    


    



